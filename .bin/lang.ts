
import { i18nExcel } from '@dotaddon/rigger'
import { existsSync, mkdirSync } from 'fs'

if (!existsSync('.cache/lang'))
    mkdirSync('.cache/lang', { recursive: true })

i18nExcel('方言', '.cache/lang')