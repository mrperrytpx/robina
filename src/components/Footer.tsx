import Link from "next/link";
import { VscGithub } from "react-icons/vsc";

export const Footer = () => {
    return (
        <footer className="w-full bg-glacier-600">
            <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 px-4 py-20">
                <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-between">
                    <div className="flex flex-col items-center justify-center gap-4 p-2 text-glacier-50 md:flex-row md:gap-6">
                        <Link
                            prefetch={false}
                            className="rounded-md px-2 py-1 text-sm transition-all duration-75 hover:bg-glacier-50 hover:text-glacier-600 focus:bg-glacier-50 focus:text-glacier-600 sm:inline-block"
                            href="/tos"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            prefetch={false}
                            className="rounded-md px-2 py-1 text-sm transition-all duration-75 hover:bg-glacier-50 hover:text-glacier-600 focus:bg-glacier-50 focus:text-glacier-600 sm:inline-block"
                            href="/contact"
                        >
                            Contact
                        </Link>
                        <Link
                            prefetch={false}
                            className="rounded-md px-2 py-1 text-sm transition-all duration-75 hover:bg-glacier-50 hover:text-glacier-600 focus:bg-glacier-50 focus:text-glacier-600 sm:inline-block"
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
                        className="group mt-auto select-none rounded-full transition-all duration-75 hover:bg-glacier-50 focus:bg-glacier-50"
                    >
                        <VscGithub className="h-10 w-10 fill-glacier-50 group-hover:scale-105 group-hover:fill-glacier-900 group-focus:scale-105 group-focus:fill-glacier-900" />
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
