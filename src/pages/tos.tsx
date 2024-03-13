import Head from "next/head";
import Link from "next/link";

const TosPage = () => {
    return (
        <>
            <Head>
                <title>Terms of Service</title>
                <meta
                    name="description"
                    content="Terms of Service."
                    key="description"
                />
                <meta
                    property="og:description"
                    content="Terms of Service."
                    key="og-description"
                />
                <meta
                    property="og:title"
                    content="YetAnotherMessagingApp - ToS"
                    key="title"
                />
                <meta
                    property="og:url"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/tos`}
                    key="url"
                />
            </Head>
            <div className="mx-auto mb-20 mt-10 flex w-full max-w-screen-md flex-1 flex-col gap-6 p-4 text-glacier-900">
                <h1 className="text-2xl font-semibold">Terms of Service</h1>
                <span className="text-xl font-medium">
                    Welcome to YetAnotherMessagingApp!
                </span>
                <p className="text-sm">
                    These Terms of Service (&quot;Terms&quot;) govern your use
                    of our chatroom website and any related services provided by
                    YetAnotherMessagingApp (&quot;we,&quot; &quot;our,&quot; or
                    &quot;us&quot;). By accessing or using our website and
                    services, you agree to be bound by these Terms. If you do
                    not agree to these Terms, please do not use our website and
                    services.
                </p>
                <p className="text-sm">
                    By using our website and services, you acknowledge that you
                    have read, understood, and agreed to these Terms of Service.
                </p>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        User Conduct
                    </h2>
                    <p>
                        You must be at least 13 years old to use our website and
                        services. By using our website and services, you
                        represent and warrant that you are 13 years of age or
                        older.
                    </p>
                    <p>
                        You are solely responsible for your interactions with
                        other users on our website and within chatrooms. You
                        agree to use our website and services in a manner
                        consistent with all applicable laws and regulations and
                        not to engage in any unlawful, harmful, or abusive
                        behavior.
                    </p>
                    <p>
                        You must not use our website and services to transmit
                        any content that is unlawful, offensive, harmful,
                        defamatory, or infringes upon the rights of others. We
                        reserve the right to monitor user content and may remove
                        or suspend accounts that violate these Terms.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        User Accounts
                    </h2>
                    <p>
                        To access certain features of our website and services,
                        you may be required to create an account. You are
                        responsible for maintaining the confidentiality of your
                        account credentials and for all activities that occur
                        under your account.
                    </p>
                    <p>
                        We reserve the right to suspend or terminate any user
                        account that violates these Terms or for any other
                        reason deemed necessary by us.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Chatroom Creation and Management
                    </h2>
                    <p>
                        Our website allows you to create and manage chatrooms.
                        As the creator of a chatroom, you are responsible for
                        setting appropriate rules and guidelines for
                        participants. You must ensure that your chatroom
                        complies with these Terms and all applicable laws.
                    </p>
                    <p>
                        We do not endorse or monitor the content within
                        chatrooms created by users. However, we reserve the
                        right to remove or suspend any chatroom that violates
                        these Terms or that we deem harmful or inappropriate.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Messaging
                    </h2>
                    <p>
                        You may send and receive messages within chatrooms on
                        our website. While we do not actively monitor individual
                        messages, we reserve the right to review and moderate
                        messages that violate these Terms.
                    </p>
                    <p>
                        You are solely responsible for the content of the
                        messages you send. You must not send any messages that
                        are unlawful, offensive, harmful, or violate the rights
                        of others.
                    </p>
                    <p>
                        We do not guarantee the privacy or confidentiality of
                        messages sent within chatrooms. Please exercise caution
                        when sharing sensitive information.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Intellectual Property
                    </h2>
                    <p>
                        Our website and services, including all content and
                        features, are protected by intellectual property laws
                        and belong to us or our licensors. You may not use,
                        copy, modify, distribute, or reproduce any part of our
                        website or services without our prior written consent.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Disclaimer of Warranty
                    </h2>
                    <p>
                        Our website and services are provided &quot;as is&quot;
                        without any warranty of any kind. We do not guarantee
                        the accuracy, completeness, or reliability of any
                        content or information on our website. You use our
                        website and services at your own risk.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Limitation of Liability
                    </h2>
                    <p>
                        We shall not be liable for any direct, indirect,
                        incidental, special, or consequential damages arising
                        out of or in connection with the use of our website and
                        services.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Amendments
                    </h2>
                    <p>
                        We reserve the right to update or modify these Terms at
                        any time without prior notice. Any changes will be
                        effective upon posting the revised Terms on our website.
                    </p>
                </article>
                <article className="flex flex-col items-start gap-2 text-sm">
                    <h2 className="text-base font-semibold underline">
                        Contact Information
                    </h2>
                    <p>
                        If you have any questions or concerns regarding these
                        Terms, please{" "}
                        <Link
                            className="font-bold underline"
                            prefetch={false}
                            href="/contact"
                        >
                            contact us!
                        </Link>
                    </p>
                </article>
            </div>
        </>
    );
};

export default TosPage;
