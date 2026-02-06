import * as React from "react"
import { Legend, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "../../lib/utils"

// --- Chart Config ---
export type ChartConfig = {
    [key: string]: {
        label?: React.ReactNode
        icon?: React.ComponentType
        color?: string
        theme?: Record<string, string>
    }
}

type ChartContextProps = {
    config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a ChartContainer")
    }
    return context
}

// --- ChartContainer ---
export const ChartContainer = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        config: ChartConfig
        children: React.ReactElement
    }
>(({ id, className, config, children, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                ref={ref}
                data-chart={chartId}
                className={cn(
                    "flex aspect-video justify-center text-xs overflow-hidden [&_.recharts-cartesian-grid-horizontal_line[stroke-opacity='0.5']]:stroke-slate-200 [&_.recharts-cartesian-grid-vertical_line[stroke-opacity='0.5']]:stroke-slate-200 [&_.recharts-curve.recharts-area]:opacity-50 [&_.recharts-dot]:item-hidden [&_.recharts-layer]:outline-none [&_.recharts-polar-grid-concentric-polygon]:fill-slate-200/50 [&_.recharts-polar-grid-concentric-circle]:fill-slate-200/50 [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 [&_.recharts-cartesian-axis-tick_text]:font-medium [&_.recharts-tooltip-cursor]:fill-slate-200 [&_.recharts-sector]:outline-none [&_.recharts-sector]:ring-0 [&_.recharts-surface]:outline-none [&_.recharts-surface]:ring-0",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(
        ([, cfg]) => cfg.color
    )

    if (colorConfig.length === 0) {
        return null
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
[data-chart=${id}] {
  ${colorConfig
                        .map(([key, item]) => {
                            const color = item.color
                            return `--color-${key}: ${color};`
                        })
                        .join("\n")}
}
`,
            }}
        />
    )
}

// --- ChartTooltip ---
export const ChartTooltip = Tooltip

// --- ChartTooltipContent ---
export const ChartTooltipContent = React.forwardRef<
    HTMLDivElement,
    any
>(
    (
        {
            active,
            payload,
            className,
            indicator = "dot",
            hideLabel = false,
            hideIndicator = false,
            label,
            labelFormatter,
            labelClassName,
            formatter,
            color,
            nameKey,
            labelKey,
        },
        ref
    ) => {
        const { config } = useChart()

        const tooltipLabel = React.useMemo(() => {
            if (hideLabel || !payload?.length) {
                return null
            }

            const [item] = payload
            const key = `${labelKey || item.dataKey || item.name || "value"}`
            const itemConfig = config[key]
            const value =
                !labelKey && typeof label === "string"
                    ? config[label]?.label || label
                    : itemConfig?.label

            if (labelFormatter) {
                return (
                    <div className={cn("font-medium", labelClassName)}>
                        {labelFormatter(value, payload)}
                    </div>
                )
            }

            if (!value) {
                return null
            }

            return <div className={cn("font-medium", labelClassName)}>{value}</div>
        }, [
            label,
            labelFormatter,
            payload,
            hideLabel,
            labelClassName,
            config,
            labelKey,
        ])

        if (!active || !payload?.length) {
            return null
        }

        const nestLabel = payload.length === 1 && indicator !== "dot"

        return (
            <div
                ref={ref}
                className={cn(
                    "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-xl",
                    className
                )}
            >
                {!nestLabel ? tooltipLabel : null}
                <div className="grid gap-1.5">
                    {payload.map((item, index) => {
                        const key = `${nameKey || item.name || item.dataKey || "value"}`
                        const itemConfig = config[key]
                        const indicatorColor = color || item.payload.fill || item.color

                        return (
                            <div
                                key={item.dataKey}
                                className={cn(
                                    "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-slate-500",
                                    indicator === "dot" && "items-center"
                                )}
                            >
                                {formatter && item?.value !== undefined && item.name ? (
                                    formatter(item.value, item.name, item, index, payload)
                                ) : (
                                    <>
                                        {!hideIndicator && (
                                            <div
                                                className={cn(
                                                    "shrink-0 rounded-[2px] border-[1.5px] border-white",
                                                    {
                                                        "h-2.5 w-2.5": indicator === "dot",
                                                        "w-1": indicator === "line",
                                                        "w-0 border-[1.5px] border-dashed bg-transparent":
                                                            indicator === "dashed",
                                                        "my-0.5": nestLabel && indicator === "dashed",
                                                    }
                                                )}
                                                style={
                                                    {
                                                        "--color-bg": indicatorColor,
                                                        backgroundColor: indicatorColor,
                                                    } as React.CSSProperties
                                                }
                                            />
                                        )}
                                        <div
                                            className={cn(
                                                "flex flex-1 justify-between leading-none",
                                                nestLabel ? "items-end" : "items-center"
                                            )}
                                        >
                                            <div className="grid gap-1.5">
                                                {nestLabel ? tooltipLabel : null}
                                                <span className="text-slate-500">
                                                    {itemConfig?.label || item.name}
                                                </span>
                                            </div>
                                            {item.value && (
                                                <span className="font-mono font-medium tabular-nums text-slate-900">
                                                    {item.value.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// --- ChartLegend ---
export const ChartLegend = Legend

// --- ChartLegendContent ---
export const ChartLegendContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        payload?: any[]
        verticalAlign?: "top" | "bottom"
        hideIcon?: boolean
        nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart()

    if (!payload?.length) {
        return null
    }

    return (
        <div
            ref={ref}
            className={cn(
                "flex items-center justify-center gap-4",
                verticalAlign === "top" ? "pb-3" : "pt-3",
                className
            )}
        >
            {payload.map((item) => {
                const key = `${nameKey || item.dataKey || "value"}`
                const itemConfig = config[key]

                return (
                    <div
                        key={item.value}
                        className={cn(
                            "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-slate-500"
                        )}
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        )}
                        <span className="text-xs font-medium text-slate-500">
                            {itemConfig?.label || item.value}
                        </span>
                    </div>
                )
            })}
        </div>
    )
})
ChartLegendContent.displayName = "ChartLegendContent"
