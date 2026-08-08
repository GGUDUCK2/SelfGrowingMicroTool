<script lang="ts">
  import AdPlaceholder from "$lib/components/AdPlaceholder.svelte";
  import Head from '$lib/components/Head.svelte';
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<Head title="Privacy Policy" description="Privacy Policy for MicroFactory" />


<svelte:head>
  <title>Privacy Policy | MicroFactory</title>
  <meta name="robots" content="noindex" />
  {@html '<script type="application/ld+json">' + JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":$page.url.origin + "/" + lang + "/privacy-policy","name":"Privacy Policy","description":"Privacy Policy for MicroFactory"}) + '</script>'}
</svelte:head>

<div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>Privacy Policy</h1>
  <p>Last updated: {new Date().toLocaleDateString()}</p>

  <p>Your privacy is fundamentally important to us. MicroFactory ("us", "we", or "our") operates the MicroFactory website and its associated suite of productivity tools. This comprehensive Privacy Policy thoroughly outlines how we approach data collection, how we utilize local technologies, and the rigorous measures we take to safeguard your information and privacy.</p>

  <h2>Data Collection and Usage Principles</h2>
  <p>MicroFactory is architected from the ground up to respect and protect your privacy. Most of our sophisticated tools run entirely and exclusively within your web browser using local, client-side APIs. We expressly do not collect, process, transmit, or store your personal data, files, or tool inputs on any remote servers unless explicitly and transparently stated otherwise.</p>

  <h2>Local Storage and Client-Side Processing</h2>
  <p>To provide a seamless and personalized experience, some of our tools may utilize your browser's local storage mechanisms (such as IndexedDB, localStorage, or sessionStorage) to save your user preferences, tool history, or customized settings. It is critical to understand that this data remains strictly contained on your personal device and is never transmitted to our servers or accessible by our team.</p>

  <h2>Log Data & Analytics</h2>
  <p>Like many website operators, we may collect non-personally identifying information that your browser routinely sends whenever you visit our Service ("Log Data"). This Log Data may include generalized information such as your computer's Internet Protocol ("IP") address (often anonymized), browser type, browser version, the specific pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other broad statistical data.</p>
  <p>We may also integrate third-party analytics services, such as Google Analytics, to collect, monitor, and comprehensively analyze this type of information. This helps us understand user behavior trends, measure tool popularity, and continuously increase our Service's overall functionality and user experience.</p>

  <h2>Cookies and Tracking Technologies</h2>
  <p>Cookies are small files containing an anonymous unique identifier. Cookies are sent to your browser from a web site and stored directly on your computer's hard drive.</p>
  <p>We use essential "cookies" to ensure the proper functioning of the site and to collect aggregate analytics information. You maintain full control over this and can instruct your browser to refuse all cookies or to explicitly indicate when a cookie is being sent. However, please be aware that if you do not accept certain functional cookies, you may experience reduced functionality or be unable to use some customized portions of our Service.</p>

  <h2>Third-Party Services and Advertisements</h2>
  <p>To support the continued development of MicroFactory, we may display advertisements via third-party ad networks such as Google AdSense. These networks may use cookies and similar technologies to serve relevant ads based on your prior visits to our website or other websites on the internet. You can typically opt out of personalized advertising by visiting the respective ad network's privacy and ad settings pages.</p>

  <h2>Security Measures</h2>
  <p>The security of your Information is paramount to us. However, please remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable, robust means to protect any data we do handle, we cannot guarantee its absolute and infallible security.</p>

  <h2>Changes To This Privacy Policy</h2>
  <p>This Privacy Policy is effective as of the date prominently stated at the top and will remain in full effect except with respect to any changes in its provisions in the future, which will become effective immediately upon being posted on this dedicated page.</p>
  <p>We reserve the right to periodically update, modify, or change our Privacy Policy at any time. We strongly encourage you to check this Privacy Policy periodically to stay informed about how we are protecting your information.</p>

  <h2>GDPR Data Protection Rights</h2>
  <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
  <ul>
    <li><strong>The right to access</strong> – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
    <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
    <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
    <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
    <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
    <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
  </ul>
  <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

  <h2>CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
  <p>Under the CCPA, among other rights, California consumers have the right to:</p>
  <ul>
    <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
    <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
    <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
  </ul>
  <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

  <h2>Indemnification and Disclaimer</h2>
  <p>MicroFactory provides its web-based productivity tools strictly on an "as-is" and "as-available" basis without any warranties of any kind. You explicitly agree that your use of the MicroFactory service is completely at your own risk. To the fullest extent permitted by applicable law, MicroFactory disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
  <p>By using this service, you agree to indemnify, defend, and hold harmless MicroFactory, its affiliates, officers, directors, employees, consultants, and agents from any and all third-party claims, liability, damages, and/or costs (including, but not limited to, attorney's fees) arising from your use of the MicroFactory tools, your violation of these terms, or your infringement of any intellectual property or other right of any person or entity.</p>

  <h2>Children's Information</h2>
  <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
  <p>MicroFactory does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>

  <h2>Contact Us</h2>
  <p>If you have any questions, concerns, or require further clarification about this Privacy Policy, please do not hesitate to contact us via our official GitHub repository, contact page, or designated support channels.</p>
</div>


<AdPlaceholder />
