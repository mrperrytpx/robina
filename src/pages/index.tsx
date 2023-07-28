import Link from "next/link";
import { Footer } from "../components/Footer";
import { type ReactNode } from "react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { prisma } from "../../prisma/prisma";
import LogoTextRectangle from "../../public/logo-text-rectangle.webp";
import LogoTextSquare from "../../public/logo-text-square.webp";
import FallbackLogoTextRectangle from "../../public/logo-text-rectangle.png";
import FallbackLogoTextSquare from "../../public/logo-text-square.png";
import { ImageWithFallback } from "../components/ImageWithFallback";

interface ITestimonyCardProps {
    children: ReactNode | ReactNode[];
    name: string;
    date: string;
}
const TestimonyCard = ({ children, name, date }: ITestimonyCardProps) => {
    return (
        <div className="flex aspect-video w-80 max-w-[300px] flex-col rounded-lg bg-white shadow shadow-sky-500 motion-safe:mx-[-60px]">
            <div className="grid flex-1 grid-cols-[60px,1fr] items-center justify-center rounded-lg px-4 py-2 shadow">
                <div className="grid aspect-square w-12 select-none items-center justify-center rounded-full bg-sky-500">
                    <span className="text-3xl uppercase text-white">
                        {name[0]}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 pl-2">
                    <span className="first-letter:uppercase">{name}</span>
                    <span className="font-mono text-sm">{date}</span>
                </div>
            </div>

            <div className="flex-[2] px-4 py-2">
                <span className="line-clamp-3 text-xl italic">
                    &quot;{children}&quot;
                </span>
            </div>
        </div>
    );
};

export default function Home({
    userCount,
}: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <div className="flex w-full flex-1 flex-col items-center overflow-x-hidden">
            <div className="flex w-full max-w-screen-lg flex-col items-start gap-40 px-2">
                <article className="flex min-h-[calc(100svh-200px)] w-full flex-col items-center justify-center gap-8 py-4">
                    <ImageWithFallback
                        src={LogoTextRectangle}
                        alt="Yet another messaging app"
                        width={500}
                        height={100}
                        className="hidden scale-150 md:block"
                        fallback={FallbackLogoTextRectangle}
                    />
                    <ImageWithFallback
                        src={LogoTextSquare}
                        alt="Yet another messaging app"
                        width={300}
                        className="md:hidden"
                        fallback={FallbackLogoTextSquare}
                    />
                    <Link
                        href="/chats"
                        className="rounded-lg px-4 py-2 font-semibold uppercase shadow hover:text-sky-500 hover:shadow-sky-500 focus:text-sky-500 focus:shadow-sky-500 sm:text-xl"
                    >
                        Start Chatting
                    </Link>
                </article>

                <article className="flex w-full flex-col gap-8 rounded-lg px-2 py-4 text-center">
                    <h2 className="text-4xl font-bold text-sky-500">
                        Have you ever asked yourself...
                    </h2>
                    <p className="font-medium sm:text-left">
                        &quot;Is there an app like Discord I can use that&apos;s
                        kind of... bad?&quot;
                    </p>
                    <p className="font-medium sm:text-right">
                        &quot;I wonder what Discord&apos;s MVP looked
                        like...&quot;
                    </p>
                    <p className="font-medium sm:text-left">
                        &quot;Is there a way for me to experience what is was
                        like using online chatrooms back in the 90&apos;s?&quot;
                    </p>
                    <p className="font-medium">
                        &quot;Man I wish all these apps didn&apos;t have so many
                        good features...&quot;
                    </p>
                </article>

                <article className="flex w-full flex-col gap-8 rounded-lg px-2 py-4 text-center">
                    <h2 className="text-4xl font-bold uppercase text-sky-500">
                        Look no further!
                    </h2>
                    <p>Presenting YetAnotherMessagingApp!</p>
                    <div>
                        <p>The simplest messaging app you&apos;ll ever use!</p>
                        <p className="text-xs font-bold">
                            (until I try to make profit from it)
                        </p>
                    </div>
                    <div>
                        <p>
                            From its minimal design to its minimal features,
                            there is simply (haha) no rival!
                        </p>
                    </div>
                </article>

                <article className="flex w-full flex-col gap-8 rounded-lg px-2 py-4 text-center">
                    <h2 className="text-2xl font-bold">
                        Check out these testimonials 😏
                    </h2>
                </article>
            </div>

            <div className="mt-8 flex grow select-text motion-reduce:w-full motion-reduce:overflow-x-auto motion-reduce:px-4 motion-reduce:py-1 motion-reduce:scrollbar-thin motion-reduce:scrollbar-track-black motion-reduce:scrollbar-thumb-sky-100 sm:mt-16">
                <div className="flex min-w-full shrink-0 items-center justify-around motion-safe:animate-scroll motion-reduce:justify-center motion-reduce:gap-8 ">
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

                <div className="flex min-w-full shrink-0 animate-scroll items-center justify-around motion-reduce:hidden">
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

            <div className="flex min-h-[80svh] w-full max-w-screen-lg flex-col items-center justify-around gap-8 px-2 text-center">
                <Link
                    href="/signin"
                    className="text-3xl font-bold uppercase hover:text-sky-500 hover:underline focus:text-sky-500 focus:underline"
                >
                    Join
                </Link>
                <span className="scale-150 text-5xl font-bold text-sky-500">
                    {userCount ? userCount : 0}
                </span>
                <span className="text-3xl font-bold">other happy users!</span>
            </div>
            <div className="mt-12 sm:mt-20" />
            <Footer />
        </div>
    );
}

export const getStaticProps: GetStaticProps<{
    userCount: number;
}> = async () => {
    const userCount = await prisma.user.count();

    return {
        props: {
            userCount,
        },
        revalidate: 60,
    };
};
