import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
} from "next";
import { getProviders, getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: ["100", "300", "400", "500", "700", "900"],
    subsets: ["latin"],
});

type ValidatedLoginForm = z.infer<typeof loginValidationSchema>;

const loginValidationSchema = z.object({
    email: z.string().email().min(1, "Required"),
});

export default function SignIn({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    const { error } = router.query;

    const {
        register,
        formState: { errors, isSubmitting },
        handleSubmit,
    } = useForm<ValidatedLoginForm>({
        resolver: zodResolver(loginValidationSchema),
    });

    // config provider order matters - same as order in authConfig file
    const allProviders = Object.values(providers).slice(1);

    const onSubmit = handleSubmit(async (data) => {
        await signIn("email", {
            email: data.email,
            callbackUrl: "/",
        });
    });

    return (
        <div className="flex w-full flex-col items-center sm:flex-auto">
            <div className="flex w-full max-w-screen-sm flex-col gap-4 p-8 sm:mt-12 sm:h-auto sm:max-w-md">
                <div className="flex w-full flex-col items-center gap-2">
                    <Link
                        href="/"
                        className="mb-4 w-full break-all rounded-md bg-white p-2 text-center text-lg font-bold tracking-wider text-glacier-900 shadow transition-all duration-75 hover:bg-glacier-600 hover:text-glacier-50 hover:shadow-glacier-600 focus:bg-glacier-600 focus:text-glacier-50 focus:shadow-glacier-600"
                    >
                        YetAnotherMessagingApp
                    </Link>
                    {error === "SessionRequired" && (
                        <p className="text-center text-sm text-red-600">
                            <u>
                                Please <strong>Sign In</strong> to access this
                                page.
                            </u>
                        </p>
                    )}
                    {error === "OAuthAccountNotLinked" && (
                        <p className="text-center text-sm text-red-600">
                            <u>
                                This email is already linked, but not to this
                                OAuth account.
                            </u>
                        </p>
                    )}
                    {error === "Default" && (
                        <p className="text-center text-sm text-red-600">
                            Something is wrong... Try again.
                        </p>
                    )}
                </div>
                <form
                    method="post"
                    action="/api/auth/signin/email"
                    onSubmit={onSubmit}
                    className="flex w-full flex-col gap-2"
                >
                    <fieldset>
                        <label
                            className="pl-1 text-sm font-semibold text-glacier-900"
                            htmlFor="email"
                        >
                            Email
                            <input
                                {...register("email")}
                                className={`h-10 w-full rounded-md border-2 border-glacier-900 p-2 text-sm font-medium hover:border-glacier-600 hover:outline-glacier-600 focus:border-glacier-600 focus:outline-glacier-600 ${
                                    errors.email && "border-red-600"
                                }`}
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="john.doe@foo.com"
                            />
                        </label>
                        {errors.email && (
                            <span className="pl-1 text-xs font-semibold text-red-600">
                                {errors.email.message}
                            </span>
                        )}
                    </fieldset>
                    <button
                        type="submit"
                        className="h-10 rounded-md border-2 border-glacier-900 bg-white p-2 text-sm font-medium shadow-glacier-600 transition-all duration-75 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-white enabled:focus:shadow-sm disabled:opacity-50"
                        disabled={!!isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
                <div className="relative flex w-full items-center justify-center text-xs">
                    <span className="absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transform bg-glacier-900" />
                    <span className="z-10 rounded-full bg-glacier-50 p-2 font-bold text-glacier-900">
                        OR
                    </span>
                    <span className="absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transform bg-glacier-900" />
                </div>
                {allProviders.map((provider) => (
                    <button
                        aria-label={`${provider.name} sign in.`}
                        key={provider.id}
                        className="group mb-2 flex h-[40px] w-full items-center justify-center gap-2 rounded-lg border-2 border-glacier-900 bg-white text-sm transition-all duration-75 hover:border-[#4285F4] hover:bg-[#4285F4]"
                        onClick={() => signIn(provider.id)}
                    >
                        <div className="rounded-sm bg-white p-2">
                            <Image
                                className="h-[18px] w-[18px]"
                                src="https://authjs.dev/img/providers/google.svg"
                                alt="Google Logo"
                                width={18}
                                height={18}
                            />
                        </div>
                        <span
                            className={
                                roboto.className +
                                " pr-2 font-medium text-glacier-900 group-hover:text-white"
                            }
                        >
                            Sign in with {provider.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
        return { redirect: { destination: "/chats", permanent: false } };
    }

    const providers = await getProviders();

    return {
        props: { providers: providers ?? [] },
    };
}
