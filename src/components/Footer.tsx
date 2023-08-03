import Link from "next/link";
import { VscGithub } from "react-icons/vsc";

export const Footer = () => {
    return (
        <footer className="w-full bg-glacier-600">
            <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 px-4 py-20">
                <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-between">
                    <div className="flex flex-col items-center justify-center gap-4 p-2 text-white md:flex-row md:gap-6">
                        <Link
                            prefetch={false}
                            className="border-b border-glacier-600 text-sm font-medium  text-white hover:border-glacier-100 sm:inline-block"
                            href="/tos"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            prefetch={false}
                            className="border-b border-glacier-600 text-sm font-medium  text-white hover:border-glacier-100 sm:inline-block"
                            href="/contact"
                        >
                            Contact
                        </Link>
                        <Link
                            prefetch={false}
                            className="border-b border-glacier-600 text-sm font-medium  text-white hover:border-glacier-100 sm:inline-block"
                            href="/privacy"
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
                <div className="w-full pl-2 text-center text-sm text-white md:text-left">
                    <strong>©</strong> {new Date().getFullYear()}{" "}
                    YetAnotherMessagingApp
                </div>
            </div>
        </footer>
    );
};
