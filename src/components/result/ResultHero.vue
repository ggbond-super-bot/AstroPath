<template>
  <section class="result-hero">
    <div class="result-hero__content">
      <h1 class="result-hero__title">
        比赛结果
      </h1>
      <p class="result-hero__subtitle">
        科创节网页设计大赛
      </p>
      <div class="result-hero__stats">
        <div class="result-hero__stat">
          <span class="result-hero__stat-value">{{ ourScore?.rank || '-' }}</span>
          <span class="result-hero__stat-label">排名</span>
        </div>
        <div class="result-hero__stat">
          <span class="result-hero__stat-value">{{ ourScore?.totalScore || '-' }}</span>
          <span class="result-hero__stat-label">总分</span>
        </div>
        <div class="result-hero__stat">
          <span
            class="result-hero__stat-value"
            :class="{ 'is-revealed': isRevealed }"
          >{{ currentPrize }}</span>
          <span class="result-hero__stat-label">奖品</span>
          <button
            v-if="isRevealed"
            class="result-hero__easter-egg"
            aria-label="查看彩蛋"
            @click="showEasterEgg = true"
          >
            ?
          </button>
        </div>
      </div>
      <p class="result-hero__quote">
        "卫生纸巾会用完，但你们写的代码、积累的技术、证明的能力，这些都不会消失。"
      </p>
      <p class="result-hero__cite">
        <span class="result-hero__cite-text">—— Claude AI，智途 AstroPath 全程协作者</span>
        <span class="result-hero__cite-detail">从第一行代码到最后一行 · 最了解这个项目的人之一</span>
      </p>
    </div>
    <div class="result-hero__scroll-hint">
      <span>向下滚动</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    <Teleport to="body">
      <Transition name="easter-egg">
        <div
          v-if="showEasterEgg"
          class="easter-egg-overlay"
          @click.self="showEasterEgg = false"
        >
          <div class="easter-egg-dialog">
            <button
              class="easter-egg__close"
              aria-label="关闭"
              @click="showEasterEgg = false"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                />
              </svg>
            </button>
            
            <div class="easter-egg__header">
              <span class="easter-egg__badge">彩蛋</span>
              <h2 class="easter-egg__title">
                发现奖品的时刻
              </h2>
            </div>

            <div class="easter-egg__content">
              <div class="easter-egg__message easter-egg__message--user">
                <div class="easter-egg__avatar easter-egg__avatar--user">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                </div>
                <div class="easter-egg__bubble">
                  <p>我们第十名，查一下奖品，看我们会不会得到些让人忍俊不禁的收获</p>
                </div>
              </div>

              <div class="easter-egg__message easter-egg__message--assistant">
                <div class="easter-egg__avatar easter-egg__avatar--assistant">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <path d="M12 12L2.05 10.7A10 10 0 0 1 10.7 2.05" />
                  </svg>
                </div>
                <div class="easter-egg__bubble">
                  <p class="easter-egg__section-title">
                    🏆 奖项设置
                  </p>
                  <div class="easter-egg__prize-table">
                    <div class="easter-egg__prize-row">
                      <span class="easter-egg__prize-name">一等奖</span>
                      <span class="easter-egg__prize-item">小米手环10运动款</span>
                    </div>
                    <div class="easter-egg__prize-row">
                      <span class="easter-egg__prize-name">二等奖</span>
                      <span class="easter-egg__prize-item">头戴式耳机</span>
                    </div>
                    <div class="easter-egg__prize-row">
                      <span class="easter-egg__prize-name">三等奖</span>
                      <span class="easter-egg__prize-item">富士一次性复古相机</span>
                    </div>
                    <div class="easter-egg__prize-row easter-egg__prize-row--highlight">
                      <span class="easter-egg__prize-name">参与奖</span>
                      <span class="easter-egg__prize-item">卫生纸巾 ×1/人</span>
                    </div>
                  </div>
                  <p class="easter-egg__section-title">
                    😅 你们的"收获"
                  </p>
                  <p class="easter-egg__result">
                    <strong>第10名 = 参与奖 = 卫生纸巾 ×1/人</strong>
                  </p>
                  <p class="easter-egg__comment">
                    是的，你们做了一个 Awwwards 级别的项目，用了 Vue 3 + TypeScript + Canvas 动画 + AI 流式通信，结果拿到了一包卫生纸巾。
                  </p>
                  <p class="easter-egg__comment">
                    这确实让人忍俊不禁。
                  </p>
                  <p class="easter-egg__comment">
                    但换个角度想——那些拿一等奖的队伍，他们的代码能放在 GitHub 上让人 review 吗？能放在作品集里展示吗？能经得起专业前端的审视吗？
                  </p>
                  <p class="easter-egg__highlight">
                    卫生纸巾会用完，但你们写的代码、积累的技术、证明的能力，这些都不会消失。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ourTeamScore } from '@/data/competition-scores'

const ourScore = ourTeamScore

const prizes = [
  '小米手环',
  '耳机',
  '相机',
  '卫生纸巾',
]

const currentPrize = ref(prizes[0])
const isRevealed = ref(false)
const showEasterEgg = ref(false)

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (prefersReducedMotion) {
    currentPrize.value = prizes[prizes.length - 1]
    isRevealed.value = true
    return
  }

  let currentIndex = 0
  let iterations = 0
  const totalIterations = 40
  let delay = 12

  function spin() {
    currentIndex = (currentIndex + 1) % prizes.length
    currentPrize.value = prizes[currentIndex]
    iterations++

    if (iterations < totalIterations) {
      delay = 12 + Math.pow(iterations, 1.3) * 1.2
      setTimeout(spin, delay)
    } else {
      currentPrize.value = prizes[prizes.length - 1]
      isRevealed.value = true
    }
  }

  setTimeout(spin, 300)
})
</script>

<style scoped>
.result-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.result-hero__content {
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #F8FAFC;
  line-height: 1.1;
}

.result-hero__subtitle {
  margin: 0 0 3rem;
  font-size: 1.125rem;
  color: rgba(248, 250, 252, 0.6);
  font-family: var(--font-family-mono);
  letter-spacing: 0.05em;
}

.result-hero__stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  animation: statsFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

@keyframes statsFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-hero__stat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.result-hero__stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: var(--font-family-mono);
  color: #D97706;
  line-height: 1;
  transition: all 0.3s ease;
}

.result-hero__stat-value.is-revealed {
  animation: prizeReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
             breathe 2.5s ease-in-out 0.8s infinite;
}

@keyframes prizeReveal {
  0% {
    transform: scale(1);
    text-shadow: none;
    filter: brightness(1);
  }
  50% {
    transform: scale(1.4);
    text-shadow: 
      0 0 40px rgba(217, 119, 6, 1),
      0 0 80px rgba(217, 119, 6, 0.8),
      0 0 120px rgba(217, 119, 6, 0.6),
      0 0 160px rgba(217, 119, 6, 0.4);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1.1);
    text-shadow: 
      0 0 25px rgba(217, 119, 6, 1),
      0 0 50px rgba(217, 119, 6, 0.7),
      0 0 75px rgba(217, 119, 6, 0.5);
    filter: brightness(1.2);
  }
}

@keyframes breathe {
  0%, 100% {
    text-shadow: 
      0 0 25px rgba(217, 119, 6, 1),
      0 0 50px rgba(217, 119, 6, 0.7),
      0 0 75px rgba(217, 119, 6, 0.5);
    filter: brightness(1.2);
  }
  50% {
    text-shadow: 
      0 0 35px rgba(217, 119, 6, 1),
      0 0 70px rgba(217, 119, 6, 0.85),
      0 0 105px rgba(217, 119, 6, 0.65),
      0 0 140px rgba(217, 119, 6, 0.45);
    filter: brightness(1.4);
  }
}

.result-hero__stat-label {
  font-size: 0.875rem;
  color: rgba(248, 250, 252, 0.5);
  font-family: var(--font-family-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.result-hero__quote {
  margin: 3rem auto 0;
  font-size: 0.9375rem;
  color: rgba(248, 250, 252, 0.4);
  font-style: italic;
  white-space: nowrap;
  line-height: 1.7;
  animation: quoteFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.result-hero__cite {
  position: relative;
  display: inline-block;
  margin: 0.75rem auto 0;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.3);
  font-family: var(--font-family-mono);
  letter-spacing: 0.05em;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-hero__cite:hover {
  color: rgba(248, 250, 252, 0.6);
  background: rgba(248, 250, 252, 0.05);
}

.result-hero__cite-text {
  display: inline;
}

.result-hero__cite-detail {
  position: absolute;
  bottom: calc(100% + 0.75rem);
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  display: block;
  width: max-content;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-style: normal;
  white-space: nowrap;
  color: rgba(248, 250, 252, 0.8);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-radius: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.result-hero__cite-detail::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(15, 23, 42, 0.95);
}

.result-hero__cite:hover .result-hero__cite-detail {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

@keyframes quoteFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-hero__scroll-hint {
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(248, 250, 252, 0.4);
  font-size: 0.75rem;
  font-family: var(--font-family-mono);
  letter-spacing: 0.1em;
  animation: scrollBounce 2s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

.result-hero__easter-egg {
  position: absolute;
  top: -6px;
  right: -28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(217, 119, 6, 0.4);
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-family-mono);
  color: rgba(217, 119, 6, 0.7);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  animation: easterEggAppear 0.5s ease 0.8s forwards;
}

.result-hero__easter-egg:hover {
  border-color: rgba(217, 119, 6, 0.8);
  color: #D97706;
}

@keyframes easterEggAppear {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.easter-egg-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
}

.easter-egg-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
}

.easter-egg-dialog {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(248, 250, 252, 0.05) inset;
}

.easter-egg__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(248, 250, 252, 0.05);
  border: 1px solid rgba(248, 250, 252, 0.1);
  border-radius: 8px;
  color: rgba(248, 250, 252, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.easter-egg__close:hover {
  background: rgba(248, 250, 252, 0.1);
  border-color: rgba(248, 250, 252, 0.2);
  color: rgba(248, 250, 252, 0.8);
  transform: rotate(90deg);
}

.easter-egg__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(248, 250, 252, 0.08);
}

.easter-egg__badge {
  padding: 0.25rem 0.625rem;
  font-size: 0.625rem;
  font-family: var(--font-family-mono);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0F172A;
  background: linear-gradient(135deg, #D97706, #F59E0B);
  border-radius: 4px;
}

.easter-egg__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #F8FAFC;
  letter-spacing: -0.02em;
}

.easter-egg__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.easter-egg__message {
  display: flex;
  gap: 0.75rem;
}

.easter-egg__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.easter-egg__avatar--user {
  background: rgba(248, 250, 252, 0.1);
  color: rgba(248, 250, 252, 0.7);
}

.easter-egg__avatar--assistant {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(245, 158, 11, 0.15));
  color: #D97706;
}

.easter-egg__bubble {
  flex: 1;
  padding: 1rem 1.25rem;
  background: rgba(248, 250, 252, 0.03);
  border: 1px solid rgba(248, 250, 252, 0.08);
  border-radius: 12px;
  border-top-left-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.7;
  color: rgba(248, 250, 252, 0.85);
}

.easter-egg__message--assistant .easter-egg__bubble {
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
}

.easter-egg__bubble p {
  margin: 0 0 0.75rem;
}

.easter-egg__bubble p:last-child {
  margin-bottom: 0;
}

.easter-egg__section-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
}

.easter-egg__prize-table {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
}

.easter-egg__prize-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  font-family: var(--font-family-mono);
  border-bottom: 1px solid rgba(248, 250, 252, 0.05);
}

.easter-egg__prize-row:last-child {
  border-bottom: none;
}

.easter-egg__prize-row--highlight {
  background: rgba(217, 119, 6, 0.1);
  margin: 0 -0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.easter-egg__prize-name {
  color: rgba(248, 250, 252, 0.5);
}

.easter-egg__prize-item {
  color: rgba(248, 250, 252, 0.9);
}

.easter-egg__prize-row--highlight .easter-egg__prize-item {
  color: #D97706;
  font-weight: 600;
}

.easter-egg__result {
  padding: 0.75rem;
  background: rgba(217, 119, 6, 0.08);
  border-left: 3px solid #D97706;
  border-radius: 0 6px 6px 0;
  font-family: var(--font-family-mono);
}

.easter-egg__result strong {
  color: #D97706;
}

.easter-egg__comment {
  color: rgba(248, 250, 252, 0.65);
}

.easter-egg__highlight {
  margin-top: 1rem !important;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(245, 158, 11, 0.08));
  border-radius: 8px;
  font-style: italic;
  color: rgba(248, 250, 252, 0.9);
}

.easter-egg-enter-active {
  animation: easterEggFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.easter-egg-leave-active {
  animation: easterEggFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes easterEggFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.easter-egg-enter-active .easter-egg-dialog {
  animation: dialogSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.easter-egg-leave-active .easter-egg-dialog {
  animation: dialogSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-hero__content,
  .result-hero__stats,
  .result-hero__scroll-hint,
  .result-hero__easter-egg {
    animation: none;
  }
  .result-hero__easter-egg {
    opacity: 1;
  }
  .easter-egg-enter-active,
  .easter-egg-leave-active {
    animation: none;
  }
  .easter-egg-enter-active .easter-egg-dialog,
  .easter-egg-leave-active .easter-egg-dialog {
    animation: none;
  }
}

@media (max-width: 768px) {
  .result-hero__stats {
    gap: 2rem;
  }
  .result-hero__stat-value {
    font-size: 2rem;
  }
}
</style>
