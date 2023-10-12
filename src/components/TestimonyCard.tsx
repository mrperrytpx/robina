interface ITestimonyCardProps {
    text: string;
    name: string;
    date: string;
}

export const TestimonyCard = ({ text, name, date }: ITestimonyCardProps) => {
    return (
        <div className="flex w-full max-w-[min(100%,18.75rem)] flex-col rounded-lg bg-white shadow shadow-glacier-600 xl:aspect-video xl:w-80 xl:max-w-[18.75rem]">
            <div className="grid flex-1 grid-cols-[3.75rem,1fr] items-center justify-center rounded-lg px-4 py-2 shadow">
                <div className="grid aspect-square w-12 select-none items-center justify-center rounded-full bg-glacier-500">
                    <span className="text-3xl uppercase text-glacier-50">
                        {name[0]}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 pl-2">
                    <span className="first-letter:uppercase">{name}</span>
                    <span className="font-mono text-sm">{date}</span>
                </div>
            </div>

            <div className="inline-block min-h-[6.25rem] flex-[2] px-4 py-2 text-lg italic">
                &quot;{text}&quot;
            </div>
        </div>
    );
};
