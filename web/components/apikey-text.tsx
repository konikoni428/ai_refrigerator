'use client'

import { getApiKey } from '@/app/actions'

import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Input } from './ui/input'


export type APIKeyTextRef = {
  loadApiKey: () => void
}


const APIKeyText = forwardRef<APIKeyTextRef>(function APIKeyTextComponent({}, ref) {
  const [loading, setLoading] = useState<boolean>(true)
  const [apiKey, setApiKey] = useState<string | undefined>(undefined)

  const loadApiKey = async () => {
    const res = await getApiKey()
    setApiKey(res.apiKey ?? undefined)
  }

  useImperativeHandle(ref, () => ({
    loadApiKey
  }))

  useEffect(() => {
    setLoading(true)
    loadApiKey().then(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div>Loading...</div>
    )
  } else {
    return (
      <>
        <Input disabled value={apiKey ?? 'no api key'} />
      </>
    )
  }
})

export { APIKeyText }