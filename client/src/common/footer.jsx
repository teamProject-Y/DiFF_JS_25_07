export default function Footer() {
    const OPS_EMAIL = 'diff.io.kr@gmail.com';
    const mailtoHref = `mailto:${OPS_EMAIL}?subject=${encodeURIComponent('[DiFF] 문의')}`;

    return (
        <footer className="relative bg-gray-100 text-white w-full min-h-[200px] text-center p-3 text-sm">
            <div className="absolute top-0 inset-x-20 border-t border-gray-500">
            <p className="mt-10 text-gray-600">
                email:{' '}
                <a href={mailtoHref} className="hover:text-gray-400 duration-100">
                    { OPS_EMAIL }
                </a>
            </p>
            <br />
            <p className="text-gray-600">
                GitHub Issues:{' '}
                <a
                    href="https://github.com/teamProject-Y/DiFF/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400 duration-100"
                >
                    teamProject-Y/DiFF/issues
                </a>
            </p>
            </div>
        </footer>
    );
}
