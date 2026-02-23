import type { PolicyData } from '$lib/types/policy-forge';

const en = {
    privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated:",
        intro: (company: string, website: string) => `This Privacy Policy describes how ${company} (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from ${website} (the "Site") or otherwise communicate with us.`,
        collectTitle: "Collecting Personal Information",
        collectIntro: "When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases.",
        deviceInfo: {
            title: "Device Information",
            purpose: "To load the Site accurately for you, and to perform analytics on Site usage to optimize our Site.",
            source: "Collected automatically when you access our Site using cookies, log files, web beacons, tags, or pixels.",
            collected: "Version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site."
        },
        orderInfo: {
            title: "Order Information",
            purpose: "To provide products or services to you to fulfill our contract, to process your payment information, arrange for shipping, and provide you with invoices and/or order confirmations.",
            source: "Collected from you.",
            collected: (fields: string[]) => fields.length > 0 ? fields.join(', ') : 'Name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.'
        },
        sharingTitle: "Sharing Personal Information",
        sharingIntro: "We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you.",
        behavioralTitle: "Behavioral Advertising",
        behavioralIntro: "As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you.",
        rightsTitle: "Your Rights",
        gdpr: "If you are a resident of the European Economic Area (EEA), you have the right to access the Personal Information we hold about you, to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased.",
        ccpa: "If you are a resident of California, you have the right to access the Personal Information we hold about you (also known as the 'Right to Know'), to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased.",
        contactTitle: "Contact",
        contactIntro: (email: string, address: string) => `For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at [${email}] or by mail using the details provided below:\n\n${address}`
    },
    terms: {
        title: "Terms of Service",
        lastUpdated: "Last updated:",
        overviewTitle: "Overview",
        overviewIntro: (company: string) => `This website is operated by ${company}. Throughout the site, the terms "we", "us" and "our" refer to ${company}.`,
        section1: "Section 1 - Online Store Terms",
        ageClause: (age: number) => `By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.`,
        section2: "Section 2 - General Conditions",
        generalClause: "We reserve the right to refuse service to anyone for any reason at any time.",
        section3: "Section 3 - Accuracy, Completeness and Timeliness of Information",
        accuracyClause: "We are not responsible if information made available on this site is not accurate, complete or current.",
        terminationTitle: "Termination",
        terminationClause: "The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes.",
        lawTitle: "Governing Law",
        lawClause: (law: string) => `These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of ${law}.`,
        contactTitle: "Contact Information",
        contactClause: (email: string) => `Questions about the Terms of Service should be sent to us at ${email}.`
    },
    fields: {
        name: "Name",
        email: "Email address",
        phone: "Phone number",
        address: "Billing and shipping address",
        payment: "Payment information (including credit card numbers)",
        social: "Social media profile information"
    }
};

const ko = {
    privacy: {
        title: "개인정보 처리방침",
        lastUpdated: "최종 수정일:",
        intro: (company: string, website: string) => `본 개인정보 처리방침은 귀하가 ${website} (이하 "사이트")를 방문하거나 서비스를 이용하거나 구매할 때, 또는 기타 방식으로 당사와 소통할 때 ${company} (이하 "회사", "당사")가 귀하의 개인정보를 수집, 사용 및 공개하는 방법을 설명합니다.`,
        collectTitle: "개인정보 수집",
        collectIntro: "귀하가 사이트를 방문할 때, 당사는 귀하의 기기, 사이트 상호작용 및 구매 처리에 필요한 특정 정보를 수집합니다.",
        deviceInfo: {
            title: "기기 정보",
            purpose: "사이트를 정확하게 로드하고, 사이트 사용에 대한 분석을 수행하여 사이트를 최적화하기 위함입니다.",
            source: "쿠키, 로그 파일, 웹 비콘, 태그 또는 픽셀을 사용하여 사이트에 액세스할 때 자동으로 수집됩니다.",
            collected: "웹 브라우저 버전, IP 주소, 시간대, 쿠키 정보, 보는 사이트 또는 제품, 검색어 및 사이트 상호작용 방식."
        },
        orderInfo: {
            title: "주문 정보",
            purpose: "계약을 이행하기 위해 제품 또는 서비스를 제공하고, 결제 정보를 처리하고, 배송을 준비하고, 송장 및/또는 주문 확인서를 제공하기 위함입니다.",
            source: "귀하로부터 직접 수집됩니다.",
            collected: (fields: string[]) => fields.length > 0 ? fields.join(', ') : '이름, 청구 주소, 배송 주소, 결제 정보, 이메일 주소 및 전화번호.'
        },
        sharingTitle: "개인정보 공유",
        sharingIntro: "당사는 서비스 제공 및 계약 이행을 돕기 위해 서비스 제공업체와 개인정보를 공유합니다.",
        behavioralTitle: "맞춤형 광고",
        behavioralIntro: "위에서 설명한 바와 같이, 당사는 귀하가 관심을 가질 만한 타겟 광고나 마케팅 커뮤니케이션을 제공하기 위해 귀하의 개인정보를 사용합니다.",
        rightsTitle: "귀하의 권리",
        gdpr: "귀하가 유럽 경제 지역(EEA) 거주자인 경우, 당사가 보유한 귀하의 개인정보에 액세스하고, 이를 새로운 서비스로 이동하고, 개인정보의 정정, 업데이트 또는 삭제를 요청할 권리가 있습니다.",
        ccpa: "귀하가 캘리포니아 거주자인 경우, 당사가 보유한 귀하의 개인정보에 액세스하고('알 권리'), 이를 새로운 서비스로 이동하고, 개인정보의 정정, 업데이트 또는 삭제를 요청할 권리가 있습니다.",
        contactTitle: "연락처",
        contactIntro: (email: string, address: string) => `당사의 개인정보 보호 관행에 대한 자세한 정보가 필요하거나 질문이 있거나 불만을 제기하려면 다음 이메일 [${email}] 또는 아래 주소로 우편을 통해 문의해 주십시오:\n\n${address}`
    },
    terms: {
        title: "서비스 이용약관",
        lastUpdated: "최종 수정일:",
        overviewTitle: "개요",
        overviewIntro: (company: string) => `이 웹사이트는 ${company}에 의해 운영됩니다. 사이트 전체에서 "당사", "저희", "우리"라는 용어는 ${company}를 지칭합니다.`,
        section1: "제 1조 - 온라인 스토어 약관",
        ageClause: (age: number) => `본 이용약관에 동의함으로써 귀하는 거주하는 주 또는 지역의 성년 연령 이상이거나, 거주하는 주 또는 지역의 성년 연령 이상이며 미성년 부양가족이 이 사이트를 사용할 수 있도록 동의했음을 나타냅니다.`,
        section2: "제 2조 - 일반 조건",
        generalClause: "당사는 언제든지 어떤 이유로든 누구에게나 서비스를 거부할 권리가 있습니다.",
        section3: "제 3조 - 정보의 정확성, 완전성 및 적시성",
        accuracyClause: "이 사이트에서 제공되는 정보가 부정확하거나 불완전하거나 최신 정보가 아니더라도 당사는 책임을 지지 않습니다.",
        terminationTitle: "해지",
        terminationClause: "해지일 이전에 발생한 당사자의 의무와 책임은 모든 목적을 위해 본 계약이 종료된 후에도 존속합니다.",
        lawTitle: "준거법",
        lawClause: (law: string) => `본 이용약관 및 당사가 귀하에게 서비스를 제공하는 별도의 계약은 ${law}의 법률에 따라 규율되고 해석됩니다.`,
        contactTitle: "연락처 정보",
        contactClause: (email: string) => `이용약관에 대한 질문은 ${email}로 보내주십시오.`
    },
    fields: {
        name: "이름",
        email: "이메일 주소",
        phone: "전화번호",
        address: "청구 및 배송 주소",
        payment: "결제 정보",
        social: "소셜 미디어 프로필 정보"
    }
};

export function generatePrivacy(data: PolicyData, lang: string = 'en'): string {
    const t = lang === 'ko' ? ko.privacy : en.privacy;
    const f = lang === 'ko' ? ko.fields : en.fields;
    const { companyName, websiteUrl, email, address, lastUpdated } = data;

    let md = `# ${t.title}\n\n`;
    md += `**${t.lastUpdated}** ${lastUpdated}\n\n`;
    md += `${t.intro(companyName || '[Company Name]', websiteUrl)}\n\n`;

    // 1. Collecting Info
    md += `## ${t.collectTitle}\n\n`;
    md += `${t.collectIntro}\n\n`;

    if (data.collectDevice) {
        md += `### ${t.deviceInfo.title}\n\n`;
        md += `*   **${lang === 'ko' ? '수집 목적' : 'Purpose of collection'}:** ${t.deviceInfo.purpose}\n`;
        md += `*   **${lang === 'ko' ? '수집 출처' : 'Source of collection'}:** ${t.deviceInfo.source}\n`;
        md += `*   **${lang === 'ko' ? '수집 항목' : 'Personal Information collected'}:** ${t.deviceInfo.collected}\n\n`;
    }

    if (data.collectPayment || data.collectAddress || data.collectEmail || data.collectName || data.collectPhone || data.collectSocial) {
        const collectedFields = [];
        if (data.collectName) collectedFields.push(f.name);
        if (data.collectAddress) collectedFields.push(f.address);
        if (data.collectPayment) collectedFields.push(f.payment);
        if (data.collectEmail) collectedFields.push(f.email);
        if (data.collectPhone) collectedFields.push(f.phone);
        if (data.collectSocial) collectedFields.push(f.social);

        md += `### ${t.orderInfo.title}\n\n`;
        md += `*   **${lang === 'ko' ? '수집 목적' : 'Purpose of collection'}:** ${t.orderInfo.purpose}\n`;
        md += `*   **${lang === 'ko' ? '수집 출처' : 'Source of collection'}:** ${t.orderInfo.source}\n`;
        md += `*   **${lang === 'ko' ? '수집 항목' : 'Personal Information collected'}:** ${t.orderInfo.collected(collectedFields)}\n\n`;
    }

    // 2. Sharing
    md += `## ${t.sharingTitle}\n\n`;
    md += `${t.sharingIntro}\n\n`;

    // 3. Behavioral Advertising
    if (data.hasAds || data.hasNewsletter) {
        md += `## ${t.behavioralTitle}\n\n`;
        md += `${t.behavioralIntro}\n\n`;
    }

    // 4. Rights
    md += `## ${t.rightsTitle}\n\n`;
    md += `${t.gdpr}\n\n`;
    md += `${t.ccpa}\n\n`;

    // 5. Contact
    md += `## ${t.contactTitle}\n\n`;
    md += `${t.contactIntro(email || '[Email]', address || '[Address]')}\n\n`;

    return md;
}

export function generateTerms(data: PolicyData, lang: string = 'en'): string {
    const t = lang === 'ko' ? ko.terms : en.terms;
    const { companyName, email, minAge, governingLaw, lastUpdated } = data;

    let md = `# ${t.title}\n\n`;
    md += `**${t.lastUpdated}** ${lastUpdated}\n\n`;

    md += `## ${t.overviewTitle}\n\n`;
    md += `${t.overviewIntro(companyName || '[Company Name]')}\n\n`;

    md += `## ${t.section1}\n\n`;
    md += `${t.ageClause(minAge)}\n\n`;

    md += `## ${t.section2}\n\n`;
    md += `${t.generalClause}\n\n`;

    md += `## ${t.section3}\n\n`;
    md += `${t.accuracyClause}\n\n`;

    if (data.termination) {
        md += `## ${t.terminationTitle}\n\n`;
        md += `${t.terminationClause}\n\n`;
    }

    md += `## ${t.lawTitle}\n\n`;
    md += `${t.lawClause(governingLaw)}\n\n`;

    md += `## ${t.contactTitle}\n\n`;
    md += `${t.contactClause(email || '[Email]')}\n\n`;

    return md;
}
