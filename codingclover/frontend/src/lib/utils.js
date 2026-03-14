import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// 라이브러리 출동방지className={cn("어쩌구")} 이렇게 쓰면됨
