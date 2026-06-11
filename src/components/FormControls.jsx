import { useEffect, useMemo, useRef, useState } from "react";

function parseDateValue(value) {
    if (!value) return new Date();

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return new Date();
    }

    return new Date(year, month - 1, day);
}

function formatDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isSameDay(left, right) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

function useCloseOnOutsideClick(ref, onClose) {
    useEffect(() => {
        function handlePointerDown(event) {
            if (!ref.current?.contains(event.target)) {
                onClose();
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, ref]);
}

export function CustomSelect({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);
    const selectedOption =
        options.find((option) => option.value === value) || options[0];

    useCloseOnOutsideClick(rootRef, () => setIsOpen(false));

    return (
        <div className="customSelect" ref={rootRef}>
            <button
                type="button"
                className="customSelectButton"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
            >
                <span>{selectedOption?.label}</span>
            </button>

            {isOpen && (
                <div className="customSelectPanel" role="listbox">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            className={
                                option.value === value
                                    ? "customSelectOption active"
                                    : "customSelectOption"
                            }
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function DatePicker({ value, onChange, locale = "en-US" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => parseDateValue(value));
    const rootRef = useRef(null);
    const selectedDate = parseDateValue(value);
    const today = new Date();
    const monthLabel = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
    }).format(viewDate);
    const weekdayLabels = useMemo(() => {
        const baseDate = new Date(2024, 0, 7);

        return Array.from({ length: 7 }, (_, index) =>
            new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
                new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + index)
            )
        );
    }, [locale]);
    const days = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const blanks = Array.from({ length: firstDay }, () => null);
        const monthDays = Array.from(
            { length: totalDays },
            (_, index) => new Date(year, month, index + 1)
        );

        return [...blanks, ...monthDays];
    }, [viewDate]);

    useCloseOnOutsideClick(rootRef, () => setIsOpen(false));

    function shiftMonth(offset) {
        setViewDate(
            (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
        );
    }

    return (
        <div className="datePicker" ref={rootRef}>
            <button
                type="button"
                className="datePickerButton"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => {
                    setViewDate(parseDateValue(value));
                    setIsOpen((current) => !current);
                }}
            >
                <span>{value}</span>
            </button>

            {isOpen && (
                <div className="datePickerPanel" role="dialog">
                    <div className="datePickerHeader">
                        <button type="button" onClick={() => shiftMonth(-1)}>
                            &lt;
                        </button>
                        <strong>{monthLabel}</strong>
                        <button type="button" onClick={() => shiftMonth(1)}>
                            &gt;
                        </button>
                    </div>

                    <div className="datePickerGrid datePickerWeekdays">
                        {weekdayLabels.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className="datePickerGrid">
                        {days.map((day, index) =>
                            day ? (
                                <button
                                    type="button"
                                    key={day.toISOString()}
                                    className={[
                                        isSameDay(day, selectedDate) ? "selected" : "",
                                        isSameDay(day, today) ? "today" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    onClick={() => {
                                        onChange(formatDateValue(day));
                                        setIsOpen(false);
                                    }}
                                >
                                    {day.getDate()}
                                </button>
                            ) : (
                                <span key={`blank-${index}`} />
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
