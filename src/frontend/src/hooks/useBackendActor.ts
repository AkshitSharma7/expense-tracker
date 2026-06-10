import { createActor } from "@/backend";
import { useActor as useCaffeineActor } from "@caffeineai/core-infrastructure";
import type { backendInterface } from "../backend.d";

export function useActor() {
  return useCaffeineActor<backendInterface>(createActor);
}
