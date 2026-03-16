'use client'

import Image from 'next/image'
import {BaseStepItem} from '../types'
import {useState} from 'react'
import {FormControl, FormField, FormItem} from '@/components/ui/form'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {UseFormReturn} from 'react-hook-form'
import {OnboardingFormValues} from '..'
import {cn} from '@/lib/utils'

interface BaseStepProps {
  data: BaseStepItem[]
  isRowData?: boolean
  form: UseFormReturn<OnboardingFormValues>
  name: keyof OnboardingFormValues
}

const BaseStep: React.FC<BaseStepProps> = ({
  data,
  isRowData = false,
  form,
  name,
}) => {
  const val = form.getValues(name)
  const [selectedIndex, setSelectedIndex] = useState(
    data.findIndex((item) => item.value === val),
  )

  const selectedItem = data[selectedIndex]
  return (
    <div
      className={cn(
        `flex gap-4 max-h-75.25`,
        isRowData
          ? 'max-w-300 justify-center items-center'
          : 'w-full max-w-148',
      )}
    >
      {!isRowData && (
        <Image
          src={selectedItem.image}
          width={202}
          height={301}
          className='object-cover border-3 border-black rounded-2xl'
          alt='visualize step'
        />
      )}
      <div className='overflow-y-auto pr-2 flex-2'>
        <FormField
          control={form.control}
          name={name}
          render={({field}) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value)
                    const index = data.findIndex((i) => i.value === value)
                    setSelectedIndex(index)
                  }}
                  value={field.value}
                  className={`${isRowData ? 'flex gap-3' : 'flex flex-col gap-2'}`}
                >
                  {data.map((item) => (
                    <FormItem key={item.title}>
                      <FormControl>
                        <label
                          className={cn(
                            `gap-3 px-4 rounded-lg cursor-pointer transition bg-[#f0f0f0] text-[#364250]  py-4
                  `,
                            isRowData
                              ? 'min-w-75 flex items-start justify-center'
                              : 'flex items-center justify-between',
                            field.value === item.value &&
                              'border-[#9a5d5c] border-2',
                          )}
                        >
                          {isRowData ? (
                            <div className='flex items-center justify-center flex-col gap-2'>
                              <Image
                                src={item.image}
                                width={95}
                                height={131}
                                className='object-cover rounded-2xl'
                                alt='visualize step'
                              />
                              <span className='text-center font-bold text-lg'>
                                {item.title}
                              </span>
                            </div>
                          ) : (
                            <div className='flex flex-col'>
                              <span className='font-bold'>{item.title}</span>
                              {item.subTitle && <span>{item.subTitle}</span>}
                            </div>
                          )}
                          <RadioGroupItem
                            value={item.value}
                            className={cn(
                              'border-gray-700 data-[state=checked]:border-[#ae5453]  [&_svg]:fill-[#c64a4a] [&_svg]:scale-150',
                              isRowData && 'hidden',
                            )}
                          />
                        </label>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export default BaseStep
