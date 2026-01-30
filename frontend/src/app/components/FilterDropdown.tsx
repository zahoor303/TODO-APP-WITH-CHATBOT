"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Fragment } from 'react';
import FilterIcon from './icons/FilterIcon';
import { motion } from "framer-motion";

interface FilterDropdownProps {
  onFilterChange: (filter: { status?: string; priority?: string }) => void;
}

export default function FilterDropdown({ onFilterChange }: FilterDropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-2 rounded-lg bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-4 py-3 text-sm font-semibold text-white shadow-sm border border-gray-600 hover:from-gray-600/50 hover:to-gray-700/50 transition-all duration-300">
          <FilterIcon className="w-5 h-5" />
          <span>Filter</span>
        </MenuButton>
      </div>

      <MenuItems
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-lg shadow-xl border border-gray-700/50 focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({})}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              All Tasks
            </a>
          </MenuItem>
          <div className="border-t border-gray-700 my-1" />
          <p className="px-4 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Status</p>
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({ status: 'pending' })}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              Pending
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({ status: 'completed' })}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              Completed
            </a>
          </MenuItem>
          <div className="border-t border-gray-700 my-1" />
          <p className="px-4 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Priority</p>
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({ priority: 'low' })}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              Low
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({ priority: 'medium' })}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              Medium
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="#"
              onClick={() => onFilterChange({ priority: 'high' })}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              High
            </a>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
