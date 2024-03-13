import Link from "next/link";
import { Footer } from "../components/Footer";
import LogoTextRectangle from "../../public/logo-text-rect.webp";
import LogoTextSquare from "../../public/logo-text-square.webp";
import FallbackLogoTextRectangle from "../../public/logo-text-rect.png";
import FallbackLogoTextSquare from "../../public/logo-text-square.png";
import { ImageWithFallback } from "../components/ImageWithFallback";
import DemonstrationGif from "../assets/work.gif";
import Image from "next/image";
import { TestimonyCard } from "../components/TestimonyCard";
import { testimonies } from "../consts/fakeTestimonials";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function Home() {
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

                <article className="text-center space-y-8 rounded-lg px-2 py-4 font-medium">
                    <span className="bg-glacier-100 px-2 py-1 rounded-md">
                        Introducing
                    </span>
                    <h2 className="text-5xl font-extrabold text-glacier-600">
                        Yet Another Messaging App
                    </h2>
                    <p className="text-lg xl:text-left">
                        Create a space for your community. Chat with friends.
                        Meet new people. Express yourself. All in one place.
                    </p>
                </article>

                <div className="relative mx-auto hidden w-full max-w-3xl items-center justify-center px-4 md:flex">
                    <Image
                        src={DemonstrationGif}
                        className="z-10 w-full"
                        width={996}
                        height={869}
                        alt="A gif which showcases a potential experience flow when using this website. There are 2 mobile views next to each other. A user on the right side invites the user on the left side to their chatroom. The right user sends a single message, then the left user starts spamming the chatroom. Then the right user removes the left user from the chatroom and both of them get a toast notification about it."
                    />
                    <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 space-y-4 p-4 text-center text-xs">
                        <LoadingSpinner size={40} color={"rgb(51 115 135)"} />
                        <p>
                            There&apos;s supposed to be a GIF demonstration of a
                            simple experience flow example here... 🤔
                        </p>
                        <p>
                            Should be loading in anytime soon. (2.7 Megabytes)
                        </p>
                    </div>
                </div>

                <article className="space-y-8 rounded-lg px-2 py-4 font-medium">
                    <h2 className="text-5xl font-extrabold text-glacier-600">
                        Create Your Own Chatrooms
                    </h2>
                    <p className="text-lg xl:text-left">
                        It&apos;s easy to make your own space. Invite your
                        friends and start talking.
                    </p>
                </article>
                <article className="space-y-8 rounded-lg px-2 py-4 font-medium">
                    <h2 className="text-5xl font-extrabold text-glacier-600">
                        Real-Time Conversations
                    </h2>
                    <p className="text-lg xl:text-left">
                        Chat on the go with our web app. Share stories, make new
                        friends and stay connected anywhere in the world. The
                        perfect place for your community to hang out.
                    </p>
                </article>
            </div>

            <article className="space-y-10">
                <div className="w-full max-w-screen-lg text-center mx-auto">
                    <h2 className="text-2xl font-bold">
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

            <Footer />
        </div>
    );
}
