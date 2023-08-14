interface ILoadingSpinnerProps {
    size?: number;
    color?: string;
}
export const LoadingSpinner = ({ size = 32, color }: ILoadingSpinnerProps) => {
    return (
        <div className="flex items-center justify-center">
            <div
                className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent p-0.5 align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
                style={{
                    width: size / 16 + "rem",
                    height: size / 16 + "rem",
                    borderColor: color ? color : "black",
                    borderRightColor: "transparent",
                }}
            />
        </div>
    );
};
