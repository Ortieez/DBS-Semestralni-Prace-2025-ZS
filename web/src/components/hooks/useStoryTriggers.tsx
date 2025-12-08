import { useCallback } from 'react';
import type { State } from '../../utils/state';
import type { StoryManager } from '../../utils/storyFlow';
import { STORY_TRIGGERS } from '../../utils/storyFlow';

interface UseStoryTriggersProps {
    storyManager: StoryManager | null;
    setProgress: React.Dispatch<React.SetStateAction<State>>;
}

export const useStoryTriggers = ({ storyManager, setProgress }: UseStoryTriggersProps) => {
    const triggerStoryEvent = useCallback((eventKey: string) => {
        if (!storyManager) return;
        
        storyManager.triggerEvent(eventKey);
        setProgress((prev) => ({
            ...prev,
            currentStoryEvent: storyManager.getCurrentEventKey(),
        }));
    }, [storyManager, setProgress]);

    const onFirewallPasswordFailed = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED);
    }, [triggerStoryEvent]);

    const onStudentPasswordFound = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.STUDENT_PASSWORD_FOUND);
    }, [triggerStoryEvent]);

    const onFirewall1Beaten = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.FIREWALL_1_BEATEN);
    }, [triggerStoryEvent]);

    const onFirewall2Beaten = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.FIREWALL_2_BEATEN);
    }, [triggerStoryEvent]);

    const onFirewall3Beaten = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.FIREWALL_3_BEATEN);
    }, [triggerStoryEvent]);

    const onFirewall4Beaten = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.FIREWALL_4_BEATEN);
    }, [triggerStoryEvent]);

    const onFirewall4HintNeeded = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.NEED_FIREWALL_4_HINT);
    }, [triggerStoryEvent]);

    const onBotnetDeleted = useCallback(() => {
        triggerStoryEvent(STORY_TRIGGERS.BOTNET_DELETED);
    }, [triggerStoryEvent]);

    return {
        onFirewallPasswordFailed,
        onStudentPasswordFound,
        onFirewall1Beaten,
        onFirewall2Beaten,
        onFirewall3Beaten,
        onFirewall4Beaten,
        onFirewall4HintNeeded,
        onBotnetDeleted,
    };
};
