const { test, expect } = require('@playwright/test');

// Helper: pick random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

test('UI & UX Test: CelcomDigi Business Page', async ({ page }) => {
  // 1️⃣ Visit homepage
  await page.goto('https://business.celcomdigi.com');

  // 2️⃣ Verify key sections visible
  const keyHeadings = [
    '5G and Digital Solutions for Enterprise',
    'Your Trusted Business Partner'
  ];
  for (const heading of keyHeadings) {
    await expect(page.locator(`text=${heading}`)).toBeVisible();
  }

  // 3️⃣ Verify hero video background is loaded
  const heroVideo = page.locator('video, iframe');
  await expect(heroVideo.first()).toBeVisible();
  console.log('Hero video is visible.');

  // 3a️⃣ Verify YouTube play button works
  const youtubeButton = page.locator('button[aria-label*="Play"], .youtube-play-button');
  if (await youtubeButton.count() > 0) {
    await youtubeButton.first().click();
    await page.waitForTimeout(2000);
    const isPaused = await heroVideo.first().evaluate((video) => video.paused);
    expect(isPaused).toBe(false);
    console.log('YouTube video button works and video is playing.');
  }

  // 4️⃣ Verify each solution card button navigates to the correct page
  const solutions = [
    { name: 'Mobile', url: '/mobile' },
    { name: 'Internet', url: '/internet' },
    { name: 'IoT', url: '/iot' },
    { name: 'Cloud', url: '/cloud' },
    { name: 'Cyber Security', url: '/cybersecurity' }
  ];

  for (const solution of solutions) {
    const cardButton = page.locator(`text=${solution.name}`).first();
    await cardButton.click();
    await page.waitForLoadState('networkidle');

    // Check that URL ends with correct path
    await expect(page).toHaveURL(new RegExp(`${solution.url}$`));
    console.log(`${solution.name} button navigates correctly.`);

    // Go back to homepage before next iteration
    await page.goto('https://business.celcomdigi.com');
  }

  // 5️⃣ Randomly select a solution (for testing form on that page)
  const randomSolution = getRandomItem(solutions);
  await page.click(`text=${randomSolution.name}`);
  await expect(page.locator(`text=${randomSolution.name}`)).toBeVisible();
  console.log(`Random solution selected for form testing: ${randomSolution.name}`);

  // 6️⃣ Scroll to form
  await page.locator('text=Find the Right Fit for Your Business').scrollIntoViewIfNeeded();

  // 7️⃣ Randomize form selections
  const businessTypes = ['SME', 'Corporate', 'Public Sector'];
  const industries = ['Healthcare', 'Finance', 'Education', 'Retail', 'Technology'];
  const businessNeeds = [
    'Get Reliable Connectivity',
    'Improve Security',
    'Adopt Cloud Solutions',
    'Optimize IoT',
    'Enhance Mobile Experience'
  ];

  await page.selectOption('select[name="business_type"]', getRandomItem(businessTypes));
  await page.selectOption('select[name="industry"]', getRandomItem(industries));
  await page.selectOption('select[name="business_needs"]', getRandomItem(businessNeeds));
  console.log('Random form selections applied.');

  // 8️⃣ Submit form
  await page.click('text=Discover');

  // 9️⃣ Capture screenshot for AI / visual testing
  await page.screenshot({ path: 'screenshots/business_discover.png', fullPage: true });

  // 🔟 Verify bottom CTA visible
  await expect(page.locator('text=Get it now')).toBeVisible();
});
