import Link from "next/link";
import { VscGithub } from "react-icons/vsc";

export const Footer = () => {
    return (
        <footer className="w-full bg-sky-500 px-2">
            <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 py-8">
                <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
                    <div className="flex flex-col items-center justify-center gap-4 p-2 text-white md:flex-row md:gap-6">
                        <Link
                            className="font-medium hover:text-black hover:underline focus:text-black focus:underline"
                            href="/s/tos"
                        >
                            Returns & FAQ
                        </Link>
                        <Link
                            className="font-medium hover:text-black hover:underline focus:text-black focus:underline"
                            href="/s/contact"
                        >
                            Contact
                        </Link>
                        <Link
                            className="font-medium hover:text-black hover:underline focus:text-black focus:underline"
                            href="/s/privacy"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://github.com/mrperrytpx/robina/"
                        aria-label="Github"
                        className="group mt-auto select-none"
                    >
                        <VscGithub
                            className="fill-white group-hover:fill-black group-focus:fill-black"
                            size={40}
                        />
                    </a>
                </div>
                <div className="w-full pl-2 text-sm text-white md:text-left">
                    <strong>©</strong> {new Date().getFullYear()}{" "}
                    YetAnotherMessagingApp
                </div>
            </div>
        </footer>
    );
};