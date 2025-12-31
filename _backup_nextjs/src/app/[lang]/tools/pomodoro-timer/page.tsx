import { Metadata } from 'next';
import PomodoroTimerClient from './timer-client';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;
    const isKo = lang === 'ko';
    return {
        title: isKo ? '뽀모도로 집중 타이머 | 무료 온라인 생산성 도구' : 'Pomodoro Focus Timer | Free Online Productivity Tool',
        description: isKo
            ? '25분 집중, 5분 휴식. 효과적인 시간 관리를 위한 무료 온라인 뽀모도로 타이머입니다. 설치 없이 바로 사용하세요.'
            : 'Boost your productivity with this free online Pomodoro Timer. 25 minutes work, 5 minutes break. No installation required.',
        keywords: isKo ? ['뽀모도로', '타이머', '집중', '시간관리', '생산성'] : ['pomodoro', 'timer', 'focus', 'productivity', 'time management'],
    }
}

export default async function PomodoroTimer({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <PomodoroTimerClient lang={lang} />;
}
