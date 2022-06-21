import React, {
    KeyboardEventHandler,
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Controller } from 'react-hook-form';

import Button from '@popup/shared/Button';
import Form, { useForm } from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';

type ItemProps = PropsWithChildren<{
    value: number;
    checked: boolean;
    onFocus(v: number): void;
    onBlur(): void;
    onClick(): void;
    name: string;
}>;

function EntityItem({ name, value, children, onFocus, onClick, onBlur, checked }: ItemProps) {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <label onMouseUp={onClick}>
            <input
                name={name}
                type="radio"
                value={value}
                onFocus={() => onFocus(value)} // onFocus used for selection to consistently select elements with keyboard.
                onBlur={onBlur}
                checked={checked}
                readOnly
            />
            {children}
        </label>
    );
}

type FormValues = {
    [key: string]: number;
};

type Props<E extends Record<string, unknown>> = {
    /**
     * Entities to render in list
     */
    entities: E[];
    /**
     * Callback for when an entity has been selected from the list
     */
    onSelect(entity: E): void;
    /**
     * Action for creating new entities
     */
    onNew(): void;
    /**
     * Callback function for rendering list items
     *
     * @param entity an entity to render
     * @param checked whether the entity is checked (i.e. internally selected)
     *
     * @example
     *  <EntityList ...>
     *      {(e, checked) => <div className={checked ? 'checked' : 'unchecked'}>{e.text}</div>}
     *  </EntityList>
     */
    children(entity: E, checked: boolean): JSX.Element;
    /**
     * Callback for getting key of list item corresponding to entity
     */
    getKey(entity: E): string | number;
    /**
     * Keys of object E that should be included in search
     */
    searchableKeys?: Array<keyof E>;
    /**
     * Text for button for creating new entities
     */
    newText: string;
};

export default function EntityList<E extends Record<string, unknown>>({
    entities,
    children,
    onSelect,
    onNew,
    getKey,
    searchableKeys,
    newText,
}: Props<E>) {
    const { current: id } = useRef(uuidv4());
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const formMethods = useForm<FormValues>();

    useEffect(() => {
        formMethods.setValue(id, 0);
    }, [search]);

    const handleSearchBlur = useCallback(() => {
        formMethods.resetField(id);
    }, [formMethods.resetField]);

    const handleSearchFocus = useCallback(() => {
        const currentValue = formMethods.getValues()[id];

        if (currentValue === undefined) {
            formMethods.setValue(id, 0);
        }
    }, [formMethods.setValue]);

    /** entities filtered by searching through values corresponding to "searchableKeys" */
    const filteredEntities = useMemo(
        () =>
            entities.filter((entity) =>
                Object.entries(entity)
                    .filter(([k]) => (searchableKeys ? searchableKeys.includes(k) : true))
                    .some(([, v]) => (typeof v === 'string' ? v.includes(search) : false))
            ),
        [entities, search]
    );

    const handleSearchKey: KeyboardEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                // Propagate selection of the currently checked entity.
                const currentValue = formMethods.getValues()[id];
                onSelect(filteredEntities[currentValue]);
            } else if (e.key === 'ArrowDown') {
                // Shift focus to options list
                const radio = rootRef.current?.querySelector('input[type="radio"]') as HTMLInputElement | undefined;
                radio?.focus();
            }
        },
        [filteredEntities]
    );

    const handleSubmit = (values: FormValues) => {
        const selected = entities[values[id]];
        onSelect(selected);
    };

    return (
        <div className="entity-list" ref={rootRef}>
            <div>
                <input
                    type="search"
                    placeholder="Search"
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyUp={handleSearchKey}
                    onBlur={handleSearchBlur}
                    onFocus={handleSearchFocus}
                />
                <Button clear onClick={onNew}>
                    {newText} +
                </Button>
            </div>
            <Form<FormValues> onSubmit={handleSubmit} formMethods={formMethods}>
                {(f) => (
                    <>
                        {filteredEntities.map((entity, i) => (
                            <Controller
                                control={f.control}
                                name={id}
                                key={getKey(entity)}
                                render={({ field }) => (
                                    <EntityItem
                                        name={field.name}
                                        value={i}
                                        checked={field.value === i}
                                        onFocus={field.onChange}
                                        onBlur={field.onBlur}
                                        onClick={() => onSelect(entity)}
                                    >
                                        {children(entity, field.value === i)}
                                    </EntityItem>
                                )}
                            />
                        ))}
                        <Submit className="entity-list__submit">Submit</Submit>
                    </>
                )}
            </Form>
        </div>
    );
}
