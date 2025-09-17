export default function Footer() {
    const OPS_EMAIL = 'support@diff.io.kr';
    const mailtoHref = `mailto:${OPS_EMAIL}?subject=${encodeURIComponent('[DiFF] 문의')}`;

    return (
        <footer className="bg-gray-800 text-white text-center p-3 text-sm">
            <p>
                email:{' '}
                <a href={mailtoHref} className="underline hover:no-underline">
                    {OPS_EMAIL}
                </a>
            </p>
            <p>
                GitHub Issues:{' '}
                <a
                    href="https://github.com/teamProject-Y/DiFF/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                >
                    teamProject-Y/DiFF/issues
                </a>
            </p>
        </footer>
    );
}
