import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAssetPath(path: string) {
    const basePath = process.env.NODE_ENV === 'production' ? '/inumeshi' : '';
    return `${basePath}${path.startsWith('/') ? path : '/' + path}`;
}

export function smoothScrollTo(element: HTMLElement, duration: number = 1000, offset: number = 0) {
    const start = window.scrollY || window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    const distance = targetPosition - start;
    let startTime: number | null = null;

    function animation(currentTime: number) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function (easeInOutQuad)
    function ease(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}
