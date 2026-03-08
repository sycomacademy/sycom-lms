"use client";

import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useRefWithInit } from "@base-ui/utils/useRefWithInit";
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/packages/utils/cn";

const ROOT_NAME = "Editable";
const LABEL_NAME = "EditableLabel";
const AREA_NAME = "EditableArea";
const PREVIEW_NAME = "EditablePreview";
const INPUT_NAME = "EditableInput";
const TRIGGER_NAME = "EditableTrigger";
const TOOLBAR_NAME = "EditableToolbar";
const CANCEL_NAME = "EditableCancel";
const SUBMIT_NAME = "EditableSubmit";

type Direction = "ltr" | "rtl";

interface StoreState {
  value: string;
  editing: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null
): T {
  const contextStore = useContext(StoreContext);
  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = useCallback(
    () => selector(store.getState()),
    [store, selector]
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface EditableContextValue {
  rootId: string;
  inputId: string;
  labelId: string;
  defaultValue: string;
  onCancel: () => void;
  onEdit: () => void;
  onSubmit: (value: string) => void;
  onEnterKeyDown?: (event: KeyboardEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: Direction;
  maxLength?: number;
  placeholder?: string;
  triggerMode: "click" | "dblclick" | "focus";
  autosize: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
}

const EditableContext = createContext<EditableContextValue | null>(null);

function useEditableContext(consumerName: string) {
  const context = useContext(EditableContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface EditableProps extends Omit<ComponentProps<"div">, "onSubmit"> {
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultEditing?: boolean;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onSubmit?: (value: string) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onEnterKeyDown?: (event: KeyboardEvent) => void;
  dir?: Direction;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  triggerMode?: EditableContextValue["triggerMode"];
  autosize?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
}

function Editable(props: EditableProps) {
  const {
    value: valueProp,
    defaultValue = "",
    defaultEditing,
    editing: editingProp,
    onValueChange,
    onEditingChange,
    onCancel: onCancelProp,
    onEdit: onEditProp,
    onSubmit: onSubmitProp,
    onEscapeKeyDown,
    onEnterKeyDown,
    dir,
    maxLength,
    name,
    placeholder,
    triggerMode = "click",
    autosize = false,
    disabled,
    required,
    readOnly,
    invalid,
    className,
    id,
    ref,
    ...rootProps
  } = props;

  const instanceId = useId();
  const rootId = id ?? instanceId;
  const inputId = useId();
  const labelId = useId();

  const previousValueRef = useRef(defaultValue);

  const [formTrigger, setFormTrigger] = useState<HTMLDivElement | null>(null);
  const setFormTriggerRef = useCallback((node: HTMLDivElement | null) => {
    setFormTrigger(node);
  }, []);
  const mergedRef = useMergedRefs(ref, setFormTriggerRef);
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    value: valueProp ?? defaultValue,
    editing: editingProp ?? defaultEditing ?? false,
  }));

  const propsRef = useRef({
    onValueChange,
    onEditingChange,
    onCancel: onCancelProp,
    onEdit: onEditProp,
    onSubmit: onSubmitProp,
    onEscapeKeyDown,
    onEnterKeyDown,
  });
  propsRef.current = {
    onValueChange,
    onEditingChange,
    onCancel: onCancelProp,
    onEdit: onEditProp,
    onSubmit: onSubmitProp,
    onEscapeKeyDown,
    onEnterKeyDown,
  };

  const store = useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) {
          return;
        }

        if (key === "value" && typeof value === "string") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else if (key === "editing" && typeof value === "boolean") {
          stateRef.current.editing = value;
          propsRef.current.onEditingChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef]);

  const value = useStore((state) => state.value, store);

  useIsoLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  useIsoLayoutEffect(() => {
    if (editingProp !== undefined) {
      store.setState("editing", editingProp);
    }
  }, [editingProp, store]);

  const onCancel = useCallback(() => {
    const prevValue = previousValueRef.current;
    store.setState("value", prevValue);
    store.setState("editing", false);
    propsRef.current.onCancel?.();
  }, [store]);

  const onEdit = useCallback(() => {
    const currentValue = store.getState().value;
    previousValueRef.current = currentValue;
    store.setState("editing", true);
    propsRef.current.onEdit?.();
  }, [store]);

  const onSubmit = useCallback(
    (newValue: string) => {
      store.setState("value", newValue);
      store.setState("editing", false);
      propsRef.current.onSubmit?.(newValue);
    },
    [store]
  );

  const contextValue = useMemo<EditableContextValue>(
    () => ({
      rootId,
      inputId,
      labelId,
      defaultValue,
      onSubmit,
      onEdit,
      onCancel,
      onEscapeKeyDown,
      onEnterKeyDown,
      dir,
      maxLength,
      placeholder,
      triggerMode,
      autosize,
      disabled,
      readOnly,
      required,
      invalid,
    }),
    [
      rootId,
      inputId,
      labelId,
      defaultValue,
      onSubmit,
      onCancel,
      onEdit,
      onEscapeKeyDown,
      onEnterKeyDown,
      dir,
      maxLength,
      placeholder,
      triggerMode,
      autosize,
      disabled,
      required,
      readOnly,
      invalid,
    ]
  );

  return (
    <StoreContext.Provider value={store}>
      <EditableContext.Provider value={contextValue}>
        <div
          data-slot="editable"
          {...rootProps}
          className={cn("flex min-w-0 flex-col gap-2", className)}
          id={id}
          ref={mergedRef}
        />
        {isFormControl && (
          <input
            disabled={disabled}
            name={name}
            required={required}
            type="hidden"
            value={value}
          />
        )}
      </EditableContext.Provider>
    </StoreContext.Provider>
  );
}

interface EditableLabelProps extends ComponentProps<"label"> {}

function EditableLabel(props: EditableLabelProps) {
  const { className, children, ref, ...labelProps } = props;
  const context = useEditableContext(LABEL_NAME);

  return (
    <label
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      data-required={context.required ? "" : undefined}
      data-slot="editable-label"
      {...labelProps}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-required:after:ml-0.5 data-required:after:text-destructive data-required:after:content-['*']",
        className
      )}
      htmlFor={context.inputId}
      id={context.labelId}
      ref={ref}
    >
      {children}
    </label>
  );
}

interface EditableAreaProps extends ComponentProps<"div"> {}

function EditableArea(props: EditableAreaProps) {
  const { className, ref, ...areaProps } = props;
  const context = useEditableContext(AREA_NAME);
  const editing = useStore((state) => state.editing);

  return (
    <div
      data-disabled={context.disabled ? "" : undefined}
      data-editing={editing ? "" : undefined}
      data-slot="editable-area"
      dir={context.dir}
      role="group"
      {...areaProps}
      className={cn(
        "relative inline-block min-w-0 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      ref={ref}
    />
  );
}

interface EditablePreviewProps extends ComponentProps<"div"> {}

function EditablePreview(props: EditablePreviewProps) {
  const {
    onClick: onClickProp,
    onDoubleClick: onDoubleClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    className,
    ref,
    ...previewProps
  } = props;

  const context = useEditableContext(PREVIEW_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);

  const eventPropsRef = useRef({
    onClick: onClickProp,
    onDoubleClick: onDoubleClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
  });
  eventPropsRef.current = {
    onClick: onClickProp,
    onDoubleClick: onDoubleClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
  };

  const onTrigger = useCallback(() => {
    if (context.disabled || context.readOnly) {
      return;
    }
    context.onEdit();
  }, [context.onEdit, context.disabled, context.readOnly]);

  const onClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      eventPropsRef.current.onClick?.(event);
      if (event.defaultPrevented || context.triggerMode !== "click") {
        return;
      }
      onTrigger();
    },
    [onTrigger, context.triggerMode]
  );

  const onDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      eventPropsRef.current.onDoubleClick?.(event);
      if (event.defaultPrevented || context.triggerMode !== "dblclick") {
        return;
      }
      onTrigger();
    },
    [onTrigger, context.triggerMode]
  );

  const onFocus = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      eventPropsRef.current.onFocus?.(event);
      if (event.defaultPrevented || context.triggerMode !== "focus") {
        return;
      }
      onTrigger();
    },
    [onTrigger, context.triggerMode]
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      eventPropsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Enter") {
        const nativeEvent = event.nativeEvent;
        if (context.onEnterKeyDown) {
          context.onEnterKeyDown(nativeEvent);
          if (nativeEvent.defaultPrevented) {
            return;
          }
        }
        onTrigger();
      }
    },
    [onTrigger, context.onEnterKeyDown]
  );

  if (editing || context.readOnly) {
    return null;
  }

  return (
    <div
      aria-disabled={context.disabled || context.readOnly}
      data-disabled={context.disabled ? "" : undefined}
      data-empty={value ? undefined : ""}
      data-readonly={context.readOnly ? "" : undefined}
      data-slot="editable-preview"
      role="button"
      tabIndex={context.disabled || context.readOnly ? undefined : 0}
      {...previewProps}
      className={cn(
        "cursor-text truncate rounded-sm border border-transparent py-1 text-base focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-readonly:cursor-default data-empty:text-muted-foreground data-disabled:opacity-50 md:text-sm",
        className
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      {value || context.placeholder}
    </div>
  );
}

interface EditableInputProps extends ComponentProps<"input"> {
  maxLength?: number;
}

function EditableInput(props: EditableInputProps) {
  const {
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
    className,
    disabled,
    readOnly,
    required,
    maxLength,
    ref,
    ...inputProps
  } = props;

  const context = useEditableContext(INPUT_NAME);
  const store = useStoreContext(INPUT_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);

  const eventPropsRef = useRef({
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
  });
  eventPropsRef.current = {
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
  };

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;

  const onAutosize = useCallback(
    (target: HTMLInputElement) => {
      if (!context.autosize) {
        return;
      }

      if (target instanceof HTMLTextAreaElement) {
        target.style.height = "0";
        target.style.height = `${target.scrollHeight}px`;
      } else {
        target.style.width = "0";
        target.style.width = `${target.scrollWidth + 4}px`;
      }
    },
    [context.autosize]
  );

  const onBlur = useCallback(
    (event: ReactFocusEvent<HTMLInputElement>) => {
      if (isDisabled || isReadOnly) {
        return;
      }

      eventPropsRef.current.onBlur?.(event);
      if (event.defaultPrevented) {
        return;
      }

      const relatedTarget = event.relatedTarget;

      const isAction =
        relatedTarget instanceof HTMLElement &&
        (relatedTarget.closest(`[data-slot="editable-trigger"]`) ||
          relatedTarget.closest(`[data-slot="editable-cancel"]`));

      if (!isAction) {
        context.onSubmit(value);
      }
    },
    [value, context.onSubmit, isDisabled, isReadOnly]
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (isDisabled || isReadOnly) {
        return;
      }

      eventPropsRef.current.onChange?.(event);
      if (event.defaultPrevented) {
        return;
      }

      store.setState("value", event.target.value);
      onAutosize(event.target);
    },
    [store, onAutosize, isDisabled, isReadOnly]
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (isDisabled || isReadOnly) {
        return;
      }

      eventPropsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape") {
        const nativeEvent = event.nativeEvent;
        if (context.onEscapeKeyDown) {
          context.onEscapeKeyDown(nativeEvent);
          if (nativeEvent.defaultPrevented) {
            return;
          }
        }
        context.onCancel();
      } else if (event.key === "Enter") {
        context.onSubmit(value);
      }
    },
    [
      value,
      context.onSubmit,
      context.onCancel,
      context.onEscapeKeyDown,
      isDisabled,
      isReadOnly,
    ]
  );

  useIsoLayoutEffect(() => {
    if (!editing || isDisabled || isReadOnly || !inputRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (!inputRef.current) {
        return;
      }

      inputRef.current.focus();
      inputRef.current.select();
      onAutosize(inputRef.current);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [editing, onAutosize, isDisabled, isReadOnly]);

  if (!(editing || isReadOnly)) {
    return null;
  }

  return (
    <input
      aria-invalid={context.invalid}
      aria-required={isRequired}
      data-slot="editable-input"
      dir={context.dir}
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      aria-labelledby={context.labelId}
      className={cn(
        "flex rounded-sm border border-input bg-transparent py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        context.autosize ? "w-auto" : "w-full",
        className
      )}
      id={context.inputId}
      maxLength={maxLength}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={context.placeholder}
      ref={mergedRef}
      value={value}
    />
  );
}

interface EditableTriggerProps extends ComponentProps<"button"> {
  forceMount?: boolean;
}

function EditableTrigger(props: EditableTriggerProps) {
  const { forceMount = false, ref, ...triggerProps } = props;
  const context = useEditableContext(TRIGGER_NAME);
  const editing = useStore((state) => state.editing);

  const onTrigger = useCallback(() => {
    if (context.disabled || context.readOnly) {
      return;
    }
    context.onEdit();
  }, [context.disabled, context.readOnly, context.onEdit]);

  if (!forceMount && (editing || context.readOnly)) {
    return null;
  }

  return (
    <button
      aria-controls={context.rootId}
      aria-disabled={context.disabled || context.readOnly}
      data-disabled={context.disabled ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      data-slot="editable-trigger"
      type="button"
      {...triggerProps}
      onClick={context.triggerMode === "click" ? onTrigger : undefined}
      onDoubleClick={context.triggerMode === "dblclick" ? onTrigger : undefined}
      ref={ref}
    />
  );
}

interface EditableToolbarProps extends ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

function EditableToolbar(props: EditableToolbarProps) {
  const { className, orientation = "horizontal", ref, ...toolbarProps } = props;
  const context = useEditableContext(TOOLBAR_NAME);

  return (
    <div
      aria-controls={context.rootId}
      aria-orientation={orientation}
      data-slot="editable-toolbar"
      dir={context.dir}
      role="toolbar"
      {...toolbarProps}
      className={cn(
        "flex items-center gap-2",
        orientation === "vertical" && "flex-col",
        className
      )}
      ref={ref}
    />
  );
}

interface EditableCancelProps extends ComponentProps<"button"> {}

function EditableCancel(props: EditableCancelProps) {
  const { onClick: onClickProp, ref, ...cancelProps } = props;
  const context = useEditableContext(CANCEL_NAME);
  const editing = useStore((state) => state.editing);

  const eventPropsRef = useRef({ onClick: onClickProp });
  eventPropsRef.current = { onClick: onClickProp };

  const onClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (context.disabled || context.readOnly) {
        return;
      }

      eventPropsRef.current.onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      context.onCancel();
    },
    [context.onCancel, context.disabled, context.readOnly]
  );

  if (!(editing || context.readOnly)) {
    return null;
  }

  return (
    <button
      aria-controls={context.rootId}
      data-slot="editable-cancel"
      type="button"
      {...cancelProps}
      onClick={onClick}
      ref={ref}
    />
  );
}

interface EditableSubmitProps extends ComponentProps<"button"> {}

function EditableSubmit(props: EditableSubmitProps) {
  const { onClick: onClickProp, ref, ...submitProps } = props;
  const context = useEditableContext(SUBMIT_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);

  const eventPropsRef = useRef({ onClick: onClickProp });
  eventPropsRef.current = { onClick: onClickProp };

  const onClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (context.disabled || context.readOnly) {
        return;
      }

      eventPropsRef.current.onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      context.onSubmit(value);
    },
    [context.onSubmit, value, context.disabled, context.readOnly]
  );

  if (!(editing || context.readOnly)) {
    return null;
  }

  return (
    <button
      aria-controls={context.rootId}
      data-slot="editable-submit"
      type="button"
      {...submitProps}
      onClick={onClick}
      ref={ref}
    />
  );
}

export {
  Editable,
  EditableLabel,
  EditableArea,
  EditablePreview,
  EditableInput,
  EditableTrigger,
  EditableToolbar,
  EditableCancel,
  EditableSubmit,
  //
  useStore as useEditable,
  //
  type EditableProps,
};
