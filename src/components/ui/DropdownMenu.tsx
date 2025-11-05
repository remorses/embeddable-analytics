// Tremor DropdownMenu [v1.0.0]

'use client'

import React from 'react'
import * as DropdownMenuPrimitives from '@radix-ui/react-dropdown-menu'

import { cx } from '../../lib/utils'

const DropdownMenu = DropdownMenuPrimitives.Root
DropdownMenu.displayName = 'DropdownMenu'

const DropdownMenuTrigger = DropdownMenuPrimitives.Trigger
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuGroup = DropdownMenuPrimitives.Group
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

const DropdownMenuSubMenu = DropdownMenuPrimitives.Sub
DropdownMenuSubMenu.displayName = 'DropdownMenuSubMenu'

const DropdownMenuRadioGroup = DropdownMenuPrimitives.RadioGroup
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup'

const DropdownMenuSubMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.SubTrigger
      ref={forwardedRef}
      className={cx(
        'relative flex cursor-default select-none items-center rounded px-2 py-1.5 text-sm outline-none transition-colors',
        'focus:bg-accent',
        'data-[state=open]:bg-accent',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <svg
        className="ml-auto size-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </DropdownMenuPrimitives.SubTrigger>
  )
})

DropdownMenuSubMenuTrigger.displayName = 'DropdownMenuSubMenuTrigger'

const DropdownMenuSubMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.SubContent>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.SubContent
      ref={forwardedRef}
      className={cx(
        'z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-lg',
        'border-border bg-popover',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  )
})

DropdownMenuSubMenuContent.displayName = 'DropdownMenuSubMenuContent'

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Content>
>(
  (
    { className, sideOffset = 4, collisionPadding = 8, ...props },
    forwardedRef,
  ) => {
    return (
      <DropdownMenuPrimitives.Portal>
        <DropdownMenuPrimitives.Content
          ref={forwardedRef}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cx(
            'z-50 min-w-48 overflow-hidden rounded-md border p-1 shadow-lg',
            'border-border bg-popover',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitives.Portal>
    )
  },
)

DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.Item
      ref={forwardedRef}
      className={cx(
        'relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm outline-none transition-colors',
        'text-popover-foreground',
        'focus:bg-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
})

DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.CheckboxItem>
>(({ className, children, checked, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.CheckboxItem
      ref={forwardedRef}
      className={cx(
        'relative flex cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        'text-popover-foreground',
        'focus:bg-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitives.ItemIndicator>
          <svg
            className="size-full shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </DropdownMenuPrimitives.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitives.CheckboxItem>
  )
})

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.RadioItem>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.RadioItem
      ref={forwardedRef}
      className={cx(
        'relative flex cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        'text-popover-foreground',
        'focus:bg-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitives.ItemIndicator>
          <svg
            className="size-2 shrink-0 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
          >
            <circle cx={8} cy={8} r={8} />
          </svg>
        </DropdownMenuPrimitives.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitives.RadioItem>
  )
})

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.Label
      ref={forwardedRef}
      className={cx(
        'px-2 py-1.5 text-sm font-semibold',
        'text-popover-foreground',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
})

DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitives.Separator
      ref={forwardedRef}
      className={cx(
        '-mx-1 my-1 h-px bg-border',
        className,
      )}
      {...props}
    />
  )
})

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuIconWrapper = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <div
      className={cx('flex size-5 items-center justify-center', className)}
      {...props}
    />
  )
}

DropdownMenuIconWrapper.displayName = 'DropdownMenuIconWrapper'

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cx(
        'ml-auto text-xs tracking-widest opacity-60',
        'text-popover-foreground',
        className,
      )}
      {...props}
    />
  )
}

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuIconWrapper,
}
