/**
 * Seed script: Parses the cloned 500-AI-Agents-Projects repo
 * and upserts into the KnowledgeAgent table.
 * 
 * Usage: bun run scripts/seed-knowledge-base.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REPO_PATH = path.resolve(__dirname, '../knowledge-base/500-agents-repo');
const AGENTS_PATH = path.join(REPO_PATH, 'agents');

interface AgentMetadata {
  title?: string;
  description?: string;
  author?: string;
  language?: string;
  framework?: string;
  tags?: string[];
  industry?: string;
  difficulty?: string;
  llm?: string;
  entrypoint?: string;
  requirements?: string;
}

function parseYamlSimple(content: string): AgentMetadata {
  const result: AgentMetadata = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key === 'tags') {
      // Parse [tag1, tag2, tag3]
      const match = val.match(/\[(.+)\]/);
      if (match) {
        result.tags = match[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
      }
    } else {
      (result as any)[key] = val;
    }
  }
  return result;
}

async function seedAgentsFolder() {
  if (!fs.existsSync(AGENTS_PATH)) {
    console.error('Agents directory not found:', AGENTS_PATH);
    return;
  }

  const agentDirs = fs.readdirSync(AGENTS_PATH).filter(name => {
    const fullPath = path.join(AGENTS_PATH, name);
    return fs.statSync(fullPath).isDirectory();
  });

  console.log(`Found ${agentDirs.length} agent directories`);

  for (const dir of agentDirs) {
    const dirPath = path.join(AGENTS_PATH, dir);
    const metadataPath = path.join(dirPath, 'metadata.yaml');
    const readmePath = path.join(dirPath, 'README.md');
    const agentCodePath = path.join(dirPath, 'agent.py');

    // Parse metadata
    let metadata: AgentMetadata = {};
    if (fs.existsSync(metadataPath)) {
      const yamlContent = fs.readFileSync(metadataPath, 'utf-8');
      metadata = parseYamlSimple(yamlContent);
    }

    // Read README
    let readme = '';
    if (fs.existsSync(readmePath)) {
      readme = fs.readFileSync(readmePath, 'utf-8');
    }

    // Read code snippet (first 200 lines)
    let codeSnippet: string | null = null;
    if (fs.existsSync(agentCodePath)) {
      const code = fs.readFileSync(agentCodePath, 'utf-8');
      const lines = code.split('\n');
      codeSnippet = lines.slice(0, 200).join('\n');
    }

    const name = metadata.title || dir.replace(/^\d+-/, '').replace(/-/g, ' ');
    const description = metadata.description || `AI Agent: ${name}`;
    const tags = metadata.tags || [];
    const framework = metadata.framework || null;
    const llm = metadata.llm || null;
    const industry = metadata.industry || null;
    const difficulty = metadata.difficulty || null;
    const language = metadata.language || null;
    const author = metadata.author || null;

    // Determine category from industry/tags
    const category = industry || (tags.length > 0 ? tags[0] : 'general');

    try {
      await prisma.knowledgeAgent.upsert({
        where: { id: `kb-${dir}` },
        create: {
          id: `kb-${dir}`,
          name,
          category,
          description,
          tools: JSON.stringify(tags),
          models: JSON.stringify(llm ? [llm] : []),
          repoPath: `agents/${dir}`,
          readme,
          codeSnippet,
          framework,
          llm,
          industry,
          difficulty,
          language,
          tags: JSON.stringify(tags),
          author,
          isCurated: true,
        },
        update: {
          name,
          category,
          description,
          tools: JSON.stringify(tags),
          models: JSON.stringify(llm ? [llm] : []),
          repoPath: `agents/${dir}`,
          readme,
          codeSnippet,
          framework,
          llm,
          industry,
          difficulty,
          language,
          tags: JSON.stringify(tags),
          author,
        },
      });
      console.log(`  ✓ Seeded: ${name}`);
    } catch (err) {
      console.error(`  ✗ Failed to seed ${name}:`, err);
    }
  }
}

async function seedFromReadme() {
  const readmePath = path.join(REPO_PATH, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.error('Main README not found');
    return;
  }

  const readme = fs.readFileSync(readmePath, 'utf-8');
  
  // Parse industry use cases table from README
  const industrySection = readme.match(/## 🏭 Industry Use Cases[\s\S]*?(?=\n---|\n##)/);
  if (industrySection) {
    const rows = industrySection[0].match(/\| \*\*.*\*\* \|/g) || [];
    console.log(`Found ${rows.length} industry use cases in README`);

    for (const row of rows) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 2) continue;

      const name = cells[0].replace(/\*\*/g, '').trim();
      const industry = cells[1]?.trim() || 'General';
      const description = cells[2]?.trim() || '';
      
      // Extract GitHub URL
      const urlMatch = row.match(/https:\/\/github\.com\/[^\s)\]]+/);
      const sourceUrl = urlMatch ? urlMatch[0] : null;

      try {
        await prisma.knowledgeAgent.upsert({
          where: { id: `kb-readme-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}` },
          create: {
            id: `kb-readme-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
            name,
            category: industry,
            description,
            tools: JSON.stringify([]),
            models: JSON.stringify([]),
            repoPath: 'README.md',
            readme: `# ${name}\n\n${description}\n\n${sourceUrl ? `Source: ${sourceUrl}` : ''}`,
            codeSnippet: null,
            framework: null,
            llm: null,
            industry,
            difficulty: null,
            language: null,
            tags: JSON.stringify([industry.toLowerCase()]),
            author: null,
            isCurated: true,
            sourceUrl,
          },
          update: {
            category: industry,
            description,
            sourceUrl,
          },
        });
      } catch (err) {
        console.error(`  ✗ Failed to seed README agent ${name}:`, err);
      }
    }
  }

  // Parse framework sections
  const frameworkSections = readme.match(/### (CrewAI|AutoGen|Agno|LangGraph|LlamaIndex)[\s\S]*?(?=\n---|\n### )/g) || [];
  for (const section of frameworkSections) {
    const frameworkMatch = section.match(/### (\w+)/);
    const framework = frameworkMatch ? frameworkMatch[1] : 'Unknown';
    
    const rows = section.match(/\| [^|]+ \| [^|]+ \| [^|]+ \|/g) || [];
    
    for (const row of rows) {
      if (row.includes('---') || row.includes('Use Case')) continue;
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;

      const name = cells[0].replace(/[^\w\s-]/g, '').trim();
      if (!name || name.length < 2) continue;
      
      const industry = cells[1]?.trim() || 'General';
      const description = cells[2]?.trim() || '';

      // Extract URL
      const urlMatch = row.match(/https:\/\/[^\s)\]]+/);
      const sourceUrl = urlMatch ? urlMatch[0] : null;

      try {
        await prisma.knowledgeAgent.upsert({
          where: { id: `kb-fw-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)}` },
          create: {
            id: `kb-fw-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)}`,
            name,
            category: industry,
            description,
            tools: JSON.stringify([]),
            models: JSON.stringify([]),
            repoPath: 'README.md',
            readme: `# ${name}\n\n**Framework**: ${framework}\n\n${description}\n\n${sourceUrl ? `Source: ${sourceUrl}` : ''}`,
            codeSnippet: null,
            framework,
            llm: null,
            industry,
            difficulty: null,
            language: null,
            tags: JSON.stringify([framework.toLowerCase(), industry.toLowerCase()]),
            author: null,
            isCurated: true,
            sourceUrl,
          },
          update: {
            framework,
            industry,
            description,
          },
        });
      } catch (err) {
        // Skip duplicates
      }
    }
  }
}

async function seedCategories() {
  const defaultCategories = [
    { name: 'Software Development', slug: 'software-development', icon: 'code' },
    { name: 'Healthcare', slug: 'healthcare', icon: 'heart-pulse' },
    { name: 'Finance', slug: 'finance', icon: 'trending-up' },
    { name: 'Education', slug: 'education', icon: 'graduation-cap' },
    { name: 'Customer Service', slug: 'customer-service', icon: 'headphones' },
    { name: 'Marketing', slug: 'marketing', icon: 'megaphone' },
    { name: 'Research', slug: 'research', icon: 'microscope' },
    { name: 'Data Analytics', slug: 'data-analytics', icon: 'bar-chart-3' },
    { name: 'Communication', slug: 'communication', icon: 'mail' },
    { name: 'Productivity', slug: 'productivity', icon: 'zap' },
    { name: 'Cybersecurity', slug: 'cybersecurity', icon: 'shield' },
    { name: 'Legal', slug: 'legal', icon: 'scale' },
    { name: 'Human Resources', slug: 'human-resources', icon: 'users' },
    { name: 'Travel', slug: 'travel', icon: 'plane' },
    { name: 'Food', slug: 'food', icon: 'chef-hat' },
    { name: 'Media', slug: 'media', icon: 'newspaper' },
    { name: 'Gaming', slug: 'gaming', icon: 'gamepad-2' },
    { name: 'Real Estate', slug: 'real-estate', icon: 'building' },
    { name: 'Agriculture', slug: 'agriculture', icon: 'sprout' },
    { name: 'Energy', slug: 'energy', icon: 'bolt' },
    { name: 'E-commerce', slug: 'e-commerce', icon: 'shopping-cart' },
    { name: 'Supply Chain', slug: 'supply-chain', icon: 'truck' },
    { name: 'General', slug: 'general', icon: 'layers' },
    { name: 'Business', slug: 'business', icon: 'briefcase' },
    { name: 'DevOps', slug: 'devops', icon: 'git-branch' },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name, icon: cat.icon },
    });
  }
  console.log(`✓ Seeded ${defaultCategories.length} categories`);
}

async function main() {
  console.log('🌱 Starting knowledge base seeding...\n');

  // Step 1: Seed categories
  await seedCategories();

  // Step 2: Seed from agents/ folder
  console.log('\n📁 Seeding from agents/ folder...');
  await seedAgentsFolder();

  // Step 3: Seed from README tables
  console.log('\n📖 Seeding from README tables...');
  await seedFromReadme();

  // Stats
  const total = await prisma.knowledgeAgent.count();
  console.log(`\n✅ Done! Total knowledge agents: ${total}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
