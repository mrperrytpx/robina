import Head from "next/head";

const ContactPage = () => {
    return (
        <>
            <Head>
                <title>Contact Us</title>
                <meta
                    name="description"
                    content="If you need to reach us regarding any and all issues,
                        you can do so by contacting us at the email address
                        provided on the website."
                    key="description"
                />
                <meta
                    property="og:description"
                    content="If you need to reach us regarding any and all issues,
                        you can do so by contacting us at the email address
                        provided on the website."
                    key="og-description"
                />
                <meta
                    property="og:title"
                    content="YetAnotherMessagingApp - Contact us"
                    key="title"
                />
                <meta
                    property="og:url"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/contact`}
                    key="url"
                />
            </Head>
            <div className="mx-auto mb-20 mt-10 flex w-full max-w-screen-md flex-1 flex-col gap-6 p-4 text-glacier-900">
                <h1 className="text-2xl font-semibold">Contact</h1>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <p>
                        If you need to reach us regarding any and all issues,
                        you can do so by contacting us at the email address
                        provided below.
                    </p>
                    <p></p>
                    <p>
                        We aim to respond to all inquiries within 24 hours, but
                        we cannot guarantee a specific response time.
                    </p>
                    <p>
                        Additionally, please be as specific as possible when
                        sending your email, as this will allow us to provide you
                        with a more accurate response.
                    </p>
                    <p className="mt-8 w-full">
                        Contact:{" "}
                        <a href="mailto:xcosmpolitan2@gmail.com">
                            <strong>
                                <u>cosmpolitan2@gmail.com</u>
                            </strong>
                        </a>
                    </p>
                </article>
            </div>
        </>
    );
};

export default ContactPage;
