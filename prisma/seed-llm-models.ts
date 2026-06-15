import { db } from '@/lib/db'
import seedData from './arena-seed-data.json'

async function main() {
  console.log(`Seeding ${seedData.length} LLM models from Arena.ai...`)

  let added = 0
  let updated = 0
  let skipped = 0

  for (const model of seedData) {
    try {
      const existing = await db.lLMModel.findUnique({
        where: { arenaKey: model.arenaKey },
      })

      const data = {
        name: model.name,
        organization: model.organization,
        provider: model.provider || null,
        license: model.license,
        modelUrl: model.modelUrl,
        bestRank: model.bestRank,
        bestRating: model.bestRating,
        totalVotes: model.totalVotes,
        inputPricePerMillion: model.inputPricePerMillion,
        outputPricePerMillion: model.outputPricePerMillion,
        contextLength: model.contextLength,
        pricePerImage: model.pricePerImage,
        pricePerSecond: model.pricePerSecond,
        inputCapabilities: model.inputCapabilities,
        outputCapabilities: model.outputCapabilities,
        arenaCategories: model.arenaCategories,
        categoryRankings: model.categoryRankings,
        useCaseTags: model.useCaseTags,
        userSelectable: model.userSelectable,
        releaseType: model.releaseType,
        lastSyncedAt: new Date(),
      }

      if (existing) {
        await db.lLMModel.update({
          where: { arenaKey: model.arenaKey },
          data,
        })
        updated++
      } else {
        await db.lLMModel.create({
          data: { arenaKey: model.arenaKey, ...data },
        })
        added++
      }
    } catch (error: any) {
      console.error(`Error seeding ${model.arenaKey}:`, error.message)
      skipped++
    }
  }

  console.log(`\nSeeding complete: ${added} added, ${updated} updated, ${skipped} skipped`)
  console.log(`Total models in database: ${await db.lLMModel.count()}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
