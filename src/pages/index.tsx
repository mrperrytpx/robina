import Link from "next/link";
import { Footer } from "../components/Footer";
import { type ReactNode } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "../../prisma/prisma";
import LogoTextRectangle from "../../public/logo-text-rect.webp";
import LogoTextSquare from "../../public/logo-text-square.webp";
import FallbackLogoTextRectangle from "../../public/logo-text-rect.png";
import FallbackLogoTextSquare from "../../public/logo-text-square.png";
import { ImageWithFallback } from "../components/ImageWithFallback";

interface ITestimonyCardProps {
    children: ReactNode | ReactNode[];
    name: string;
    date: string;
}
const TestimonyCard = ({ children, name, date }: ITestimonyCardProps) => {
    return (
        <div className="flex w-full max-w-[min(100%,18.75rem)] flex-col rounded-lg bg-white shadow shadow-glacier-600 xl:aspect-video xl:w-80 xl:max-w-[18.75rem]">
            <div className="grid flex-1 grid-cols-[3.75rem,1fr] items-center justify-center rounded-lg px-4 py-2 shadow">
                <div className="grid aspect-square w-12 select-none items-center justify-center rounded-full bg-glacier-500">
                    <span className="text-3xl uppercase text-glacier-50">
                        {name[0]}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 pl-2">
                    <span className="first-letter:uppercase">{name}</span>
                    <span className="font-mono text-sm">{date}</span>
                </div>
            </div>

            <div className="inline-block min-h-[6.25rem] flex-[2] px-4 py-2 text-lg italic">
                &quot;{children}&quot;
            </div>
        </div>
    );
};

export default function Home({
    userCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div className="flex w-full flex-1 flex-col items-center overflow-x-hidden">
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
                    <h2 className="text-4xl font-bold text-glacier-600">
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
                    <h2 className="space text-4xl font-bold tracking-wider text-glacier-600">
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

            <article className="mt-40 flex w-full flex-col px-2 py-4 text-center">
                <h2 className="text-2xl font-bold text-glacier-900">
                    Check out these testimonials 😏
                </h2>
            </article>

            <div className="mt-8 flex min-w-full select-text motion-reduce:w-full motion-reduce:px-4 motion-reduce:py-1">
                <div className="flex min-w-full flex-row flex-wrap items-center justify-center gap-8 px-4 xl:flex xl:min-w-full xl:px-0 xl:motion-safe:animate-scroll xl:motion-safe:justify-around xl:motion-safe:gap-0">
                    <TestimonyCard name="Quivby" date="27th of July, 2023">
                        I guess it&apos;s not the worst thing I&apos;ve used...
                    </TestimonyCard>
                    <TestimonyCard name="Zandria" date="14th of June, 2020">
                        You really will do anything except get a job, huh?
                    </TestimonyCard>
                    <TestimonyCard name="Grumblewort" date="30th of July, 2023">
                        Wait, how long did this take you again!? Lmao
                    </TestimonyCard>
                    <TestimonyCard name="Jixley" date="29th of July, 2023">
                        They had websites like this when I still had hair...
                    </TestimonyCard>
                    <TestimonyCard name="Squibbert" date="1st of August, 2023">
                        Discord punching the air right now. In an alternate
                        reality, of course.
                    </TestimonyCard>
                </div>

                <div className="hidden min-w-full animate-scroll items-center justify-around xl:motion-safe:flex">
                    <TestimonyCard name="Quivby" date="27th of July, 2023">
                        I guess it&apos;s not the worst thing I&apos;ve used...
                    </TestimonyCard>
                    <TestimonyCard name="Zandria" date="14th of June, 2020">
                        You really will do anything except get a job, huh?
                    </TestimonyCard>
                    <TestimonyCard name="Grumblewort" date="30th of July, 2023">
                        Wait, how long did this take you again!? Lmao
                    </TestimonyCard>
                    <TestimonyCard name="Jixley" date="29th of July, 2023">
                        They had websites like this when I still had hair...
                    </TestimonyCard>
                    <TestimonyCard name="Squibbert" date="1st of August, 2023">
                        Discord punching the air right now. In an alternate
                        reality, of course.
                    </TestimonyCard>
                </div>
            </div>

            <div className="mb-20 mt-40 flex w-full max-w-screen-lg flex-col items-center justify-between gap-40 px-2 text-center">
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
            <div className="mt-12 xl:mt-20" />
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
