import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <div style="background-color: #a0522d; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Contact Message</h1>
                </div>
                <div style="padding: 30px; color: #374151; line-height: 1.6;">
                    <div style="margin-bottom: 25px;">
                        <p style="margin: 0 font-weight: bold; color: #a0522d; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">From</p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${name}</p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">${email}</p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <p style="margin: 0 font-weight: bold; color: #a0522d; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Subject</p>
                        <p style="margin: 5px 0; font-size: 16px; font-weight: 500;">${subject || 'No Subject'}</p>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #a0522d;">
                        <p style="margin: 0 font-weight: bold; color: #a0522d; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; margin-bottom: 10px;">Message</p>
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p>This message was sent via the PawsomeBreed contact form.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'PawsomeBreed Contact <onboarding@resend.dev>',
            to: 'pawsomebreed18@gmail.com',
            replyTo: email,
            subject: `PawsomeBreed Contact: ${subject || 'New Inquiry'}`,
            html: htmlContent,
            text: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
        });

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Email sent successfully', data });
    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: 'Failed to send email: ' + error.message }, { status: 500 });
    }
}
