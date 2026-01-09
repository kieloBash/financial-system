import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Category } from '@/lib/types/api';

interface IProps {
    value: { id: string, name: string } | null;
    onValueChange: (value: { id: string, name: string } | null) => void;
    items: Category[];
}

const CategoriesSelect = ({ value, items, onValueChange }: IProps) => {
    return (
        <Select
            value={value?.name || ''}
            onValueChange={(value) => {
                if (value !== null) {
                    const selectedCategory = items?.find((category) => category.id === value);
                    onValueChange({ id: value, name: selectedCategory?.name || '' });
                } else {
                    onValueChange(null);
                }
            }
            }
        >
            <SelectTrigger id="category" className="w-full">
                <SelectValue>{value?.name || ''}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {items?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default CategoriesSelect