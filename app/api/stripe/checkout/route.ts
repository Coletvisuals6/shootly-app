import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { packageId, creatorId, eventDate, notes } = await req.json()

    const { data: pkg } = await supabase.from('packages').select('*, creators(stripe_account_id, profiles(*))').eq('id', packageId).single()
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', user.id).single()

    // Create Stripe checkout session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: `Booking with ${(pkg.creators as any)?.profiles?.full_name}`,
          },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: profile?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/creators/${creatorId}`,
      metadata: { packageId, creatorId, clientId: user.id, eventDate: eventDate || '', notes: notes || '' },
    })

    // Create pending booking
    await supabase.from('bookings').insert({
      client_id: user.id,
      creator_id: creatorId,
      package_id: packageId,
      event_date: eventDate || null,
      notes: notes || null,
      status: 'pending',
      amount: pkg.price,
      stripe_payment_intent_id: session.payment_intent as string,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
