import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Dormitory {
  id: string
  building: string
  room: string
  floor: number
  capacity: number
  currentOccupancy: number
  status: 'active' | 'inactive'
}

export const useDormitoryStore = defineStore('dormitory', () => {
  const dormitories = ref<Dormitory[]>([
    {
      id: '1',
      building: 'A',
      room: '101',
      floor: 1,
      capacity: 4,
      currentOccupancy: 3,
      status: 'active',
    },
    {
      id: '2',
      building: 'A',
      room: '102',
      floor: 1,
      capacity: 4,
      currentOccupancy: 4,
      status: 'active',
    },
    {
      id: '3',
      building: 'A',
      room: '201',
      floor: 2,
      capacity: 4,
      currentOccupancy: 2,
      status: 'active',
    },
    {
      id: '4',
      building: 'B',
      room: '101',
      floor: 1,
      capacity: 6,
      currentOccupancy: 5,
      status: 'active',
    },
    {
      id: '5',
      building: 'B',
      room: '301',
      floor: 3,
      capacity: 4,
      currentOccupancy: 0,
      status: 'inactive',
    },
  ])

  const totalDormitories = computed(() => dormitories.value.length)

  const activeDormitories = computed(
    () => dormitories.value.filter((d) => d.status === 'active').length,
  )

  function addDormitory(dormitory: Omit<Dormitory, 'id'>) {
    const id = String(Date.now())
    dormitories.value.push({ ...dormitory, id })
  }

  function updateDormitory(id: string, updates: Partial<Omit<Dormitory, 'id'>>) {
    const index = dormitories.value.findIndex((d) => d.id === id)
    if (index !== -1) {
      dormitories.value[index] = {
        ...dormitories.value[index],
        ...updates,
      } as Dormitory
    }
  }

  function deleteDormitory(id: string) {
    const index = dormitories.value.findIndex((d) => d.id === id)
    if (index !== -1) {
      dormitories.value.splice(index, 1)
    }
  }

  function getDormitoryById(id: string) {
    return dormitories.value.find((d) => d.id === id)
  }

  return {
    dormitories,
    totalDormitories,
    activeDormitories,
    addDormitory,
    updateDormitory,
    deleteDormitory,
    getDormitoryById,
  }
})
