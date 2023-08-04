// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
import {
    type NextFetchEvent,
    type NextRequest,
    // NextResponse,
} from "next/server";

// const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(),
//     limiter: Ratelimit.cachedFixedWindow(20, "3s"),
//     analytics: true,
// });

// export default async function middleware(
//     request: NextRequest,
//     event: NextFetchEvent
// ): Promise<Response | undefined> {
//     const ip = request.ip ?? "127.0.0.1";

//     if (request.nextUrl.pathname === "/api/blocked") {
//         return NextResponse.next();
//     }

//     const { success, pending, limit, reset, remaining } =
//         await ratelimit.blockUntilReady(`ratelimit_middleware_${ip}`, 10_000);
//     event.waitUntil(pending);

//     const res = success
//         ? NextResponse.next()
//         : NextResponse.redirect(new URL("/api/blocked", request.url));

//     res.headers.set("X-RateLimit-Limit", limit.toString());
//     res.headers.set("X-RateLimit-Remaining", remaining.toString());
//     res.headers.set("X-RateLimit-Reset", reset.toString());
//     return res;
// }

// export const config = {
//     matcher: "/api/:path*",
// };

export default function middleware(
    request: NextRequest,
    event: NextFetchEvent
) {}
