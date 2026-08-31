import type { GuideContext, GuideProvider, GuideResponse } from "@/data/guide";
import { createGuideResponse } from "./GuideEngine";

export class LocalGuideProvider implements GuideProvider {
    async respond(input: string, context: GuideContext): Promise<GuideResponse> {
        return createGuideResponse(input, context);
    }
}
