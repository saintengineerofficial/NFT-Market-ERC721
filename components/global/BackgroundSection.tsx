import { forwardRef, type PropsWithChildren } from "react"

import Image from "next/image"
import { twMerge } from "tailwind-merge"

export type BackgroundSectionProps = {
  imagePath: string
  mode?: "imageFill" | "bgRepeatY" | "bgRepeatX"
  className?: string
  childrenClassName?: string
  overlayClassName?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

const BackgroundSection = forwardRef<HTMLDivElement, PropsWithChildren<BackgroundSectionProps>>((props, ref) => {
  const { overlayClassName, childrenClassName, mode, className, imagePath, children, style } = props

  if (mode === "bgRepeatY" || mode === "bgRepeatX") {
    const finalStyle = {
      ...style,
      backgroundRepeat: mode === "bgRepeatY" ? "repeat-y" : "repeat-x",
      backgroundSize: mode === "bgRepeatY" ? "100% 100%" : "auto 100%",
    }

    return (
      <div ref={ref} className={twMerge(`relative w-full overflow-hidden`, className)} style={style}>
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${imagePath})`,
            ...finalStyle,
          }}
        />

        {overlayClassName && <div className={twMerge(`absolute inset-0`, overlayClassName)} />}

        {children && <div className={twMerge(`relative z-10 w-full h-full`, childrenClassName)}>{children}</div>}
      </div>
    )
  }

  return (
    <div ref={ref} className={twMerge(`relative w-full overflow-hidden`, className)} style={style}>
      <Image src={imagePath} alt="background" fill sizes="100%" className="object-cover" />

      {overlayClassName && <div className={twMerge(`absolute inset-0`, overlayClassName)} />}

      {children && (
        <div className={twMerge(`relative z-10 w-full h-full flex items-center justify-center`, childrenClassName)}>
          {children}
        </div>
      )}
    </div>
  )
})

BackgroundSection.displayName = "BackgroundSection"

export default BackgroundSection
