import { globby } from 'globby'
import matter from 'gray-matter'
import fs from 'fs-extra'

async function getPosts() {
    let paths = await globby(['posts/**.md'])

    let posts = await Promise.all(
        paths.map(async (item) => {
            const content = await fs.readFile(item, 'utf-8')
            const { data } = matter(content)
            data.date = _convertDate(data.date)
            return {
                frontMatter: data,
                regularPath: `/${item.replace('.md', '.html')}`
            }
        })
    )
    posts.sort(_compareDate as any)
    return posts
}

function _convertDate(date?: string) {
    if (!date) {
        return undefined
    }
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
        return undefined
    }
    return parsedDate.toISOString().split('T')[0]
}

function _compareDate(
    obj1: { frontMatter: { date?: string } },
    obj2: { frontMatter: { date?: string } }
) {
    const date1 = obj1.frontMatter.date
    const date2 = obj2.frontMatter.date

    if (date1 === date2) {
        return 0
    }
    if (!date1) {
        return 1
    }
    if (!date2) {
        return -1
    }
    return date1 < date2 ? 1 : -1
}

export { getPosts }
