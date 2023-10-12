import Link from "next/link";
import { Footer } from "../components/Footer";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "../../prisma/prisma";
import LogoTextRectangle from "../../public/logo-text-rect.webp";
import LogoTextSquare from "../../public/logo-text-square.webp";
import FallbackLogoTextRectangle from "../../public/logo-text-rect.png";
import FallbackLogoTextSquare from "../../public/logo-text-square.png";
import { ImageWithFallback } from "../components/ImageWithFallback";
import DemonstrationGif from "../assets/work.gif";
import Image from "next/image";
import { TestimonyCard } from "../components/TestimonyCard";
import { testimonies } from "../consts/fakeTestimonials";

export default function Home({
    userCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div className="flex w-full flex-1 flex-col items-center space-y-52 overflow-x-hidden">
            <div className="flex h-full w-full max-w-screen-lg flex-col items-start gap-40 px-2">
                <article className="flex min-h-[min(calc(100svh-12.5rem),64rem)] w-full flex-col items-center justify-center gap-8 py-4">
                    <div className="max-h-[4.375rem] max-w-[54.6875rem]">
                        <ImageWithFallback
                            src={LogoTextRectangle}
                            alt="Yet another messaging app"
                            width={875}
                            height={70}
                            className="hidden h-full w-full select-none md:block"
                            fallback={FallbackLogoTextRectangle}
                            priority
                        />
                    </div>
                    <div className="max-h-[18.75rem] max-w-[18.75rem]">
                        <ImageWithFallback
                            src={LogoTextSquare}
                            alt="Yet another messaging app"
                            width={300}
                            height={300}
                            className="h-full w-full md:hidden"
                            fallback={FallbackLogoTextSquare}
                            priority
                        />
                    </div>
                    <Link
                        prefetch={false}
                        href="/chats"
                        className="select-none rounded-lg bg-glacier-600 px-4 py-2 text-center font-semibold uppercase text-white shadow shadow-glacier-600 transition-all duration-75 hover:bg-glacier-700 focus:bg-glacier-700 active:bg-glacier-800 xl:text-xl"
                    >
                        Start Chatting
                    </Link>
                </article>

                <article className="flex w-full flex-col gap-8 rounded-lg px-2 py-4 text-center font-medium">
                    <h2 className="text-4xl font-extrabold text-glacier-600">
                        Have you ever asked yourself...
                    </h2>
                    <p className="xl:text-left">
                        &quot;Is there an app like Discord I can use that&apos;s
                        kind of... basic?&quot;
                    </p>
                    <p className="xl:text-right">
                        &quot;I wonder what Discord&apos;s MVP looked
                        like...&quot;
                    </p>
                    <p className="xl:text-left">
                        &quot;Is there a way for me to experience what is was
                        like using online chatrooms back in the 90&apos;s?&quot;
                    </p>
                    <p>
                        &quot;Man I wish all these apps didn&apos;t have so many
                        good features...&quot;
                    </p>
                </article>

                <article className="flex w-full flex-col gap-12 rounded-lg px-2 py-4 text-center font-medium">
                    <h2 className="space text-4xl font-extrabold tracking-wider text-glacier-600">
                        Welcome home!
                    </h2>
                    <p className="text-xl">
                        Presenting YetAnotherMessagingApp!
                    </p>
                    <div>
                        <p>
                            The most basic messaging app you&apos;ll ever use!
                        </p>
                        <p className="text-xs font-bold">
                            (until I try to make profit from it)
                        </p>
                    </div>
                    <div>
                        <p>
                            From its minimal design to its minimal features,
                            there simply (haha) is no rival!
                        </p>
                    </div>
                </article>
            </div>

            <div className=" flex w-full max-w-3xl items-center justify-center px-4">
                <Image
                    src={DemonstrationGif}
                    className="w-full"
                    alt="A gif which showcases a potential experience flow when using this website. There are 2 mobile views next to each other. A user on the right side invites the user on the left side to their chatroom. The right user sends a single message, then the left user starts spamming the chatroom. Then the right user removes the left user from the chatroom and both of them get a toast notification about it."
                />
            </div>

            <article className="space-y-20">
                <div className="flex w-full flex-col px-2 py-4 text-center">
                    <h2 className="text-2xl font-bold text-glacier-900">
                        Check out these testimonials 😏
                    </h2>
                </div>

                <div className="flex min-w-full select-text motion-reduce:w-full motion-reduce:px-4 motion-reduce:py-1">
                    <div className="flex min-w-full flex-row flex-wrap items-center justify-center gap-8 px-4 xl:flex xl:min-w-full xl:px-0 xl:motion-safe:animate-scroll xl:motion-safe:justify-around xl:motion-safe:gap-0">
                        {testimonies.map((testimony) => (
                            <TestimonyCard
                                key={testimony.date}
                                {...testimony}
                            />
                        ))}
                    </div>

                    {/* Repeating cards for the marquee effect */}
                    <div className="hidden min-w-full animate-scroll items-center justify-around xl:motion-safe:flex">
                        {testimonies.map((testimony) => (
                            <TestimonyCard
                                key={testimony.date}
                                {...testimony}
                            />
                        ))}
                    </div>
                </div>
            </article>

            <div className="flex w-full max-w-screen-lg flex-col items-center justify-between gap-40 px-2 text-center">
                <Link
                    prefetch={false}
                    href="/signin"
                    className="text-3xl font-bold uppercase text-glacier-900 transition-all duration-75 hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                >
                    Join
                </Link>
                <span className="scale-150 text-5xl font-bold text-glacier-600">
                    {userCount ? userCount : 0}
                </span>
                <span className="text-3xl font-bold text-glacier-900">
                    other happy {userCount === 1 ? "user" : "users"}!
                </span>
            </div>
            <Footer />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    userCount: number;
}> = async () => {
    const userCount = await prisma.user.count();

    return {
        props: {
            userCount,
        },
    };
};
