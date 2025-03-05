"use client";

export const InfoBanner = ({ children }: { className?: string,  children: React.ReactNode }) => {
	return (
		<div className="group flex items-center justify-center">
			<p
				className={"mt-2 w-fit rounded-md border border-gray-200/10 text-sm bg-orange-200/20 tracking-wide text-orange-300 px-2 py-1 transition-all duration-300 ease-in-out"}>
				{children}
			</p>
		</div>

	);
};

