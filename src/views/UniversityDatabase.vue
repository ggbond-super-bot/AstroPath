<template>
  <div class="ud-page">
    <Teleport to="body">
      <Transition name="toast-fade">
        <div
          v-if="toast.visible"
          class="ud-toast"
          :class="'ud-toast--' + toast.type"
        >
          <span class="ud-toast__icon">{{ toastIcons[toast.type as keyof typeof toastIcons] }}</span>
          <span class="ud-toast__msg">{{ toast.message }}</span>
        </div>
      </Transition>
    </Teleport>

    <div class="ud-noise" />

    <!-- ===== HERO: 探索宣言 ===== -->
    <section
      ref="heroRef"
      class="ud-hero"
      :class="{ 'ud-hero--visible': heroVisible }"
    >
      <!-- 浮动几何网格背景 -->
      <canvas
        ref="gridCanvasRef"
        class="ud-hero__grid-canvas"
      />

      <div class="ud-hero__grid-bg" />
      <div class="ud-hero__glow" />

      <div class="ud-hero__inner">
        <div class="ud-hero__label">
          <span class="ud-hero__label-dot" />
          <span>UNIVERSITY DATABASE</span>
        </div>

        <h1
          ref="heroTitleRef"
          class="ud-hero__title"
        >
          <span
            v-for="(word, i) in heroWords"
            :key="i"
            class="ud-hero__word"
            :style="{ '--word-i': i }"
          >
            <span class="ud-hero__word-inner">{{ word }}</span>
          </span>
        </h1>

        <p class="ud-hero__sub">
          AI 智能解析背景，为你生成专属留学路线图
        </p>

        <div
          class="ud-search"
          :class="{ 'ud-search--focus': searchFocused }"
          @keyup.enter="handleHeroSearch"
        >
          <div class="ud-search__icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            ><circle
              cx="8.5"
              cy="8.5"
              r="6"
              stroke="currentColor"
              stroke-width="1.5"
            /><path
              d="M13 13L17 17"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            /></svg>
          </div>
          <input
            v-model="heroSearchKeyword"
            type="text"
            class="ud-search__field"
            placeholder="搜索院校名称、专业或国家..."
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          >
          <button
            class="ud-search__btn"
            @click="handleHeroSearch"
          >
            <span>搜索</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            ><path
              d="M3 7H11M8 4L11 7L8 10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
        </div>

        <div class="ud-hero__tags">
          <span
            v-for="tag in hotTags"
            :key="tag"
            class="ud-tag"
            @click="searchByTag(tag)"
          >{{ tag }}</span>
        </div>

        <div class="ud-hero__stats">
          <div
            v-for="(stat, i) in heroStats"
            :key="i"
            class="ud-stat"
          >
            <span class="ud-stat__num">{{ stat.value }}</span>
            <span class="ud-stat__lbl">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 主内容 ===== -->
    <section
      ref="contentRef"
      class="ud-content"
      :class="{ 'ud-content--visible': contentVisible }"
    >
      <div class="ud-container">
        <!-- Tab 导航 -->
        <nav class="ud-tabs">
          <button
            class="ud-tab"
            :class="{ 'ud-tab--active': activeTab === 'schools' }"
            @click="activeTab = 'schools'; currentSchoolPage = 1"
          >
            <span class="ud-tab__text">院校搜索</span>
            <span
              v-if="activeTab === 'schools'"
              class="ud-tab__line"
            />
          </button>
          <button
            class="ud-tab"
            :class="{ 'ud-tab--active': activeTab === 'majors' }"
            @click="activeTab = 'majors'; currentMajorPage = 1"
          >
            <span class="ud-tab__text">专业搜索</span>
            <span
              v-if="activeTab === 'majors'"
              class="ud-tab__line"
            />
          </button>
          <div class="ud-tabs__bg" />
        </nav>

        <!-- ===== TAB 1: 院校搜索 ===== -->
        <div
          v-show="activeTab === 'schools'"
          class="ud-panel"
        >
          <div class="ud-filters">
            <div class="ud-filter__row">
              <span class="ud-filter__key">国家</span>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': !filterCountry }"
                @click="filterCountry = ''"
              >
                ALL
              </button>
              <button
                v-for="country in uniqueCountries.slice(0, 4)"
                :key="country"
                class="ud-chip"
                :class="{ 'ud-chip--on': filterCountry === country }"
                @click="filterCountry = filterCountry === country ? '' : country"
              >
                {{ country }}
              </button>
            </div>

            <div class="ud-filter__row">
              <span class="ud-filter__key">排名</span>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': !filterRankRange }"
                @click="filterRankRange = ''"
              >
                ALL
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterRankRange === 'top10' }"
                @click="toggleRankFilter('top10')"
              >
                TOP 10
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterRankRange === 'top20' }"
                @click="toggleRankFilter('top20')"
              >
                TOP 30
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterRankRange === 'top50' }"
                @click="toggleRankFilter('top50')"
              >
                TOP 50
              </button>
            </div>

            <div class="ud-filter__row">
              <span class="ud-filter__key">专业</span>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': !filterMajor }"
                @click="filterMajor = ''"
              >
                ALL
              </button>
              <button
                v-for="major in uniqueMajors.slice(0, 3)"
                :key="major"
                class="ud-chip"
                :class="{ 'ud-chip--on': filterMajor === major }"
                @click="filterMajor = filterMajor === major ? '' : major"
              >
                {{ major }}
              </button>

              <div class="ud-filter__sorts">
                <button
                  class="ud-chip ud-chip--sort"
                  :class="{ 'ud-chip--on': sortBy === 'qs_rank' }"
                  @click="sortBy = sortBy === 'qs_rank' ? '' : 'qs_rank'"
                >
                  RANK ↓
                </button>
                <button
                  class="ud-chip ud-chip--sort"
                  :class="{ 'ud-chip--on': sortBy === 'acceptance_rate' }"
                  @click="sortBy = sortBy === 'acceptance_rate' ? '' : 'acceptance_rate'"
                >
                  RATE ↑
                </button>
              </div>
            </div>
          </div>

          <div class="ud-toolbar">
            <div class="ud-view-switch">
              <button
                class="ud-view-btn"
                :class="{ 'ud-view-btn--on': viewMode === 'card' }"
                @click="viewMode = 'card'"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                ><rect
                  x="2"
                  y="2"
                  width="5"
                  height="5"
                  rx="1"
                /><rect
                  x="9"
                  y="2"
                  width="5"
                  height="5"
                  rx="1"
                /><rect
                  x="2"
                  y="9"
                  width="5"
                  height="5"
                  rx="1"
                /><rect
                  x="9"
                  y="9"
                  width="5"
                  height="5"
                  rx="1"
                /></svg>
              </button>
              <button
                class="ud-view-btn"
                :class="{ 'ud-view-btn--on': viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                ><rect
                  x="2"
                  y="3"
                  width="12"
                  height="2"
                  rx="1"
                /><rect
                  x="2"
                  y="7"
                  width="12"
                  height="2"
                  rx="1"
                /><rect
                  x="2"
                  y="11"
                  width="12"
                  height="2"
                  rx="1"
                /></svg>
              </button>
            </div>
            <span class="ud-toolbar__count">
              <em>{{ totalSchools.length }}</em> 所院校
            </span>
          </div>

          <transition
            name="ud-fade"
            mode="out-in"
          >
            <div
              v-if="filteredSchools.length > 0 && viewMode === 'card'"
              key="card"
              class="ud-grid"
            >
              <div
                v-for="(school, idx) in filteredSchools"
                :key="school.id"
                class="ud-card"
                :style="{ '--card-i': idx }"
                @mouseenter="onCardHover($event, true)"
                @mouseleave="onCardHover($event, false)"
                @click="showDetail(school)"
              >
                <div
                  class="ud-card__accent"
                  :class="'ud-card__accent--' + school.rankType"
                />
                <div class="ud-card__body">
                  <div class="ud-card__head">
                    <h3 class="ud-card__name">
                      {{ school.name }}
                    </h3>
                    <span
                      class="ud-card__rank"
                      :class="'ud-card__rank--' + school.rankType"
                    >
                      {{ school.ranking }}
                    </span>
                  </div>
                  <div class="ud-card__loc">
                    <span class="ud-card__dot" />
                    {{ school.country }}
                  </div>
                  <div class="ud-card__major-row">
                    <span class="ud-card__major-icon">◆</span>
                    <span class="ud-card__major-text">{{ school.major }}</span>
                  </div>
                  <div class="ud-card__data">
                    <div class="ud-data-cell">
                      <span class="ud-data-cell__lbl">TUITION</span>
                      <span class="ud-data-cell__val">{{ school.tuition }}</span>
                    </div>
                    <div class="ud-data-cell">
                      <span class="ud-data-cell__lbl">RATE</span>
                      <span
                        class="ud-data-cell__val"
                        :class="{ 'ud-data-cell__val--low': parseFloat(school.acceptanceRate) < 20 }"
                      >{{ school.acceptanceRate }}</span>
                    </div>
                  </div>
                </div>
                <div class="ud-card__foot">
                  <button
                    class="ud-card__action"
                    :class="{ 'ud-card__action--added': shortlisted.includes(school.id ?? -1) }"
                    @click.stop="addToShortlist(school)"
                  >
                    {{ shortlisted.includes(school.id ?? -1) ? '✓ 已收藏' : '+ 收藏' }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else-if="filteredSchools.length > 0 && viewMode === 'list'"
              key="list"
              class="ud-list-wrap"
            >
              <el-table
                :data="filteredSchools"
                stripe
                class="ud-table"
                @row-click="showDetail"
              >
                <el-table-column
                  prop="name"
                  label="院校名称"
                  min-width="200"
                >
                  <template #default="scope">
                    <div class="ud-list-name">
                      <span class="ud-list-name__txt">{{ scope.row.name }}</span>
                      <span
                        class="ud-list-name__rank"
                        :class="'ud-list-name__rank--' + scope.row.rankType"
                      >
                        {{ scope.row.ranking }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="country"
                  label="国家/地区"
                  width="100"
                />
                <el-table-column
                  prop="major"
                  label="热门专业"
                  width="150"
                />
                <el-table-column
                  prop="tuition"
                  label="学费"
                  width="100"
                />
                <el-table-column
                  prop="acceptanceRate"
                  label="录取率"
                  width="90"
                >
                  <template #default="scope">
                    <span :class="{ 'ud-rate--low': parseFloat(scope.row.acceptanceRate) < 20 }">
                      {{ scope.row.acceptanceRate }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="170"
                  fixed="right"
                >
                  <template #default="scope">
                    <button
                      class="ud-tbl-btn ud-tbl-btn--primary"
                      :class="{ 'ud-tbl-btn--added': shortlisted.includes(scope.row.id) }"
                      @click.stop="addToShortlist(scope.row)"
                    >
                      {{ shortlisted.includes(scope.row.id) ? '已收藏' : '收藏' }}
                    </button>
                    <button
                      class="ud-tbl-btn"
                      @click.stop="showDetail(scope.row)"
                    >
                      详情
                    </button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </transition>

          <div
            v-if="totalSchools.length > 0"
            class="ud-pagination"
          >
            <el-pagination
              v-model:current-page="currentSchoolPage"
              v-model:page-size="schoolPageSize"
              :page-sizes="[8, 12, 24, 48]"
              :total="totalSchools.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSchoolSizeChange"
              @current-change="handleSchoolPageChange"
            />
          </div>

          <div
            v-else
            class="ud-empty"
          >
            <div class="ud-empty__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              ><circle
                cx="20"
                cy="20"
                r="13"
              /><path
                d="M30 30L40 40"
                stroke-linecap="round"
              /></svg>
            </div>
            <div class="ud-empty__title">
              暂无匹配的院校
            </div>
            <div class="ud-empty__desc">
              尝试调整筛选条件或搜索其他关键词
            </div>
          </div>
        </div>

        <!-- ===== TAB 2: 专业搜索 ===== -->
        <div
          v-show="activeTab === 'majors'"
          class="ud-panel"
        >
          <div class="ud-filters">
            <div class="ud-filter__row">
              <span class="ud-filter__key">类别</span>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': !filterCategory }"
                @click="filterCategory = ''"
              >
                ALL
              </button>
              <button
                v-for="cat in uniqueCategories"
                :key="cat"
                class="ud-chip"
                :class="{ 'ud-chip--on': filterCategory === cat }"
                @click="filterCategory = filterCategory === cat ? '' : cat"
              >
                {{ cat }}
              </button>
            </div>

            <div class="ud-filter__row">
              <span class="ud-filter__key">学位</span>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': !filterDegreeType }"
                @click="filterDegreeType = ''"
              >
                ALL
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterDegreeType === '本科' }"
                @click="filterDegreeType = filterDegreeType === '本科' ? '' : '本科'"
              >
                本科
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterDegreeType === '硕士' }"
                @click="filterDegreeType = filterDegreeType === '硕士' ? '' : '硕士'"
              >
                硕士
              </button>
              <button
                class="ud-chip"
                :class="{ 'ud-chip--on': filterDegreeType === '博士' }"
                @click="filterDegreeType = filterDegreeType === '博士' ? '' : '博士'"
              >
                博士
              </button>

              <div class="ud-micro-search">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  class="ud-micro-search__icon"
                ><circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                /><path
                  d="M9.5 9.5L12.5 12.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                /></svg>
                <input
                  v-model="majorSearchKeyword"
                  placeholder="搜索专业..."
                  class="ud-micro-search__field"
                >
              </div>
            </div>
          </div>

          <div class="ud-toolbar">
            <span class="ud-toolbar__count">
              共 <em>{{ totalMajors.length }}</em> 个专业
            </span>
          </div>

          <div
            v-if="filteredMajors.length > 0"
            class="ud-grid ud-grid--majors"
          >
            <el-checkbox-group v-model="selectedMajors">
              <div
                v-for="(major, idx) in filteredMajors"
                :key="major.id"
                class="ud-major"
                :class="'ud-major--' + getCategoryClass(major.category)"
                @mouseenter="onMajorHover($event, true)"
                @mouseleave="onMajorHover($event, false)"
                @click="goToMajorDetail(major)"
              >
                <div class="ud-major__accent" />
                <div
                  class="ud-major__compare"
                  @click.stop
                >
                  <el-checkbox :value="major.id" />
                </div>
                <div class="ud-major__body">
                  <div class="ud-major__head">
                    <span class="ud-major__idx">{{ String(idx + 1).padStart(2, '0') }}</span>
                    <span class="ud-major__cat">{{ major.category }}</span>
                  </div>
                  <div class="ud-major__name">
                    <span class="ud-major__name-cn">{{ parseMajorName(major.name).chinese }}</span>
                    <span
                      v-if="parseMajorName(major.name).english"
                      class="ud-major__name-en"
                    >
                      / {{ parseMajorName(major.name).english }}
                    </span>
                  </div>
                  <div class="ud-major__meta">
                    <span class="ud-major__degree">{{ major.degreeType }}</span>
                  </div>
                  <div class="ud-major__data">
                    <div class="ud-data-cell">
                      <span class="ud-data-cell__lbl">DURATION</span>
                      <span class="ud-data-cell__val">{{ formatDuration(major.duration) }}</span>
                    </div>
                    <div class="ud-data-cell">
                      <span class="ud-data-cell__lbl">SALARY</span>
                      <span class="ud-data-cell__val ud-data-cell--accent">{{ formatMajorSalary(major.salaryRange) }}</span>
                    </div>
                  </div>
                </div>
                <div class="ud-major__foot">
                  <button
                    class="ud-major__action"
                    @click.stop="goToMajorDetail(major)"
                  >
                    DETAILS
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style="margin-left:6px;flex-shrink:0"
                    ><path
                      d="M3 6H9M7 3L10 6L7 9"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg>
                  </button>
                </div>
              </div>
            </el-checkbox-group>
          </div>

          <div
            v-if="totalMajors.length > 0"
            class="ud-pagination"
          >
            <el-pagination
              v-model:current-page="currentMajorPage"
              v-model:page-size="majorPageSize"
              :page-sizes="[8, 12, 24, 48]"
              :total="totalMajors.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleMajorSizeChange"
              @current-change="handleMajorPageChange"
            />
          </div>

          <div
            v-else
            class="ud-empty"
          >
            <div class="ud-empty__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              ><path
                d="M12 14H36M12 24H36M12 34H28"
                stroke-linecap="round"
              /></svg>
            </div>
            <div class="ud-empty__title">
              暂无匹配的专业
            </div>
            <div class="ud-empty__desc">
              尝试调整筛选条件或搜索其他关键词
            </div>
          </div>

          <div
            v-if="selectedMajors.length > 0"
            class="ud-compare-bar"
          >
            <span class="ud-compare-bar__info">
              已选择 <strong>{{ selectedMajors.length }}</strong> 个专业进行对比
            </span>
            <button
              class="ud-compare-bar__btn ud-compare-bar__btn--primary"
              @click="showCompare"
            >
              开始对比
            </button>
            <button
              class="ud-compare-bar__btn"
              @click="clearSelection"
            >
              清空选择
            </button>
          </div>

          <!-- ===== 自定义对比模态框 ===== -->
          <Teleport to="body">
            <Transition name="ud-modal">
              <div
                v-if="compareVisible"
                class="ud-modal"
                @click.self="compareVisible = false"
                @wheel.stop
              >
                <div class="ud-modal__box">
                  <!-- 头部 -->
                  <header class="ud-modal__head">
                    <div class="ud-modal__head-left">
                      <span class="ud-modal__num">COMPARE</span>
                      <h3 class="ud-modal__title">
                        专业对比
                      </h3>
                      <span class="ud-modal__count">{{ majorsToCompare.length }} 个专业</span>
                    </div>
                    <button
                      class="ud-modal__close"
                      @click="compareVisible = false"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      ><path
                        d="M4 4L12 12M12 4L4 12"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      /></svg>
                    </button>
                  </header>

                  <!-- 表格内容 -->
                  <div class="ud-modal__body">
                    <div
                      v-if="majorsToCompare.length > 0"
                      class="ud-compare-wrap"
                    >
                      <el-table
                        :data="compareTableData"
                        border
                        class="ud-compare-table"
                      >
                        <el-table-column
                          prop="field"
                          label="对比项"
                          min-width="140"
                          fixed
                        >
                          <template #default="scope">
                            <strong>{{ scope.row.field }}</strong>
                          </template>
                        </el-table-column>
                        <el-table-column
                          v-for="major in majorsToCompare"
                          :key="major.id"
                          :label="major.name"
                          :prop="'major_' + major.id"
                          min-width="180"
                          show-overflow-tooltip
                        >
                          <template #default="scope">
                            {{ scope.row['major_' + major.id] || '-' }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>

                  <!-- 底部 -->
                  <footer class="ud-modal__foot">
                    <button
                      class="ud-btn ud-btn--ghost"
                      @click="clearSelection"
                    >
                      清空选择
                    </button>
                    <button
                      class="ud-btn ud-btn--primary"
                      @click="compareVisible = false"
                    >
                      完成
                    </button>
                  </footer>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref as vueRef } from 'vue'
import { useDatabaseState } from '@/composables/useDatabaseState'

const gridCanvasRef = vueRef<any>(null)

const {
  refs,
  visibility,
  tabs,
  search,
  pagination,
  favorites,
  majors,
  ui,
  data: dbData,
  actions
} = useDatabaseState()

const { heroRef, contentRef } = refs
const { heroVisible, contentVisible, searchFocused } = visibility
const { activeTab, viewMode } = tabs
const { heroSearchKeyword, filterCountry, filterRankRange, filterMajor, sortBy } = search
const { currentSchoolPage, schoolPageSize, currentMajorPage, majorPageSize } = pagination
const { shortlisted } = favorites
const { majorSearchKeyword, filterDegreeType, filterCategory, selectedMajors, compareVisible, majorsToCompare, compareTableData } = majors
const { hotTags, toastIcons, toast, heroWords, heroStats } = ui
const { uniqueMajors, uniqueCountries, uniqueCategories, totalMajors, filteredMajors, totalSchools, filteredSchools } = dbData
const {
  getCategoryClass,
  handleHeroSearch, searchByTag, toggleRankFilter, clearSelection,
  showCompare, showDetail, goToMajorDetail, addToShortlist,
  handleSchoolSizeChange, handleSchoolPageChange,
  handleMajorSizeChange, handleMajorPageChange,
  onCardHover, onMajorHover, parseMajorName, formatMajorSalary, formatDuration,
  initFromStorage
} = actions

let heroObserver: IntersectionObserver | null = null
let contentObserver: IntersectionObserver | null = null
let gridAnimFrame: number | null = null
let gridMouseHandler: ((e: MouseEvent) => void) | null = null
let gridResizeHandler: (() => void) | null = null

function initFloatingGrid() {
  const canvas = gridCanvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight

  const c = ctx
  const cellSize = 60
  const cols = Math.ceil(width / cellSize) + 2
  const rows = Math.ceil(height / cellSize) + 2

  let mouseX = width / 2
  let mouseY = height / 2

  gridMouseHandler = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  document.addEventListener('mousemove', gridMouseHandler)

  let time = 0

  function animate() {
    time += 0.015

    c.clearRect(0, 0, width, height)

    c.strokeStyle = 'rgba(15, 23, 42, 0.06)'
    c.lineWidth = 1

    for (let i = 0; i < cols; i++) {
      c.beginPath()
      for (let j = 0; j < rows; j++) {
        const x = i * cellSize
        const y = j * cellSize

        const dx = x - mouseX
        const dy = y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const wave = Math.sin(dist * 0.015 - time) * 15 * Math.max(0, 1 - dist / 400)

        const px = x + Math.sin(time + i * 0.3) * 3 + wave * (dx / dist || 0)
        const py = y + Math.cos(time + j * 0.3) * 3 + wave * (dy / dist || 0)

        if (j === 0) {
          c.moveTo(px, py)
        } else {
          c.lineTo(px, py)
        }
      }
      c.stroke()
    }

    for (let j = 0; j < rows; j++) {
      c.beginPath()
      for (let i = 0; i < cols; i++) {
        const x = i * cellSize
        const y = j * cellSize

        const dx = x - mouseX
        const dy = y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const wave = Math.sin(dist * 0.015 - time) * 15 * Math.max(0, 1 - dist / 400)

        const px = x + Math.sin(time + i * 0.3) * 3 + wave * (dx / dist || 0)
        const py = y + Math.cos(time + j * 0.3) * 3 + wave * (dy / dist || 0)

        if (i === 0) {
          c.moveTo(px, py)
        } else {
          c.lineTo(px, py)
        }
      }
      c.stroke()
    }

    c.fillStyle = 'rgba(15, 23, 42, 0.03)'
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cellSize
        const y = j * cellSize
        const dx = x - mouseX
        const dy = y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          const pulse = (1 - dist / 100) * 2
          c.beginPath()
          c.arc(x, y, pulse, 0, Math.PI * 2)
          c.fill()
        }
      }
    }

    gridAnimFrame = requestAnimationFrame(animate)
  }

  animate()

  gridResizeHandler = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', gridResizeHandler)
}

const setupObservers = () => {
  heroObserver = new IntersectionObserver(
    (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { heroVisible.value = true; heroObserver?.unobserve(entry.target) } }) },
    { threshold: 0.1 }
  )
  contentObserver = new IntersectionObserver(
    (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { contentVisible.value = true; contentObserver?.unobserve(entry.target) } }) },
    { threshold: 0.05 }
  )
}

onMounted(() => {
  initFloatingGrid()
  initFromStorage()
  setTimeout(() => { heroVisible.value = true }, 100)
  setupObservers()
  requestAnimationFrame(() => {
    if (heroRef.value) heroObserver?.observe(heroRef.value)
    if (contentRef.value) contentObserver?.observe(contentRef.value)
  })
  setTimeout(() => { if (!contentVisible.value) contentVisible.value = true }, 800)
})

onUnmounted(() => {
  heroObserver?.disconnect()
  contentObserver?.disconnect()
  if (gridAnimFrame) {
    cancelAnimationFrame(gridAnimFrame)
    gridAnimFrame = null
  }
  if (gridMouseHandler) {
    document.removeEventListener('mousemove', gridMouseHandler)
    gridMouseHandler = null
  }
  if (gridResizeHandler) {
    window.removeEventListener('resize', gridResizeHandler)
    gridResizeHandler = null
  }
})
</script>

<style scoped>
/* ============================================
   智途 AstroPath — 院校数据库 · Awwwards 重构
   设计语言: 档案式新极简主义
   色系: Slate(#0F172A) + Amber(#D97706)
   ============================================ */

/* ===== 页面根容器 ===== */
.ud-page {
  position: relative;
  min-height: 100vh;
  background: var(--color-background);
  overflow-x: hidden;
}

/* ===== 噪点纹理叠加 ===== */
.ud-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ===== Toast 通知 ===== */
.ud-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  pointer-events: auto;
}
.ud-toast--success,
.ud-toast--info {
  background: rgba(15, 23, 42, 0.92);
  color: #F8FAFC;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.ud-toast--error { background: rgba(220, 38, 38, 0.95); color: white; }
.ud-toast--warning { background: rgba(217, 119, 6, 0.95); color: white; }
.ud-toast__icon { flex-shrink: 0; font-weight: 700; font-size: 15px; }
.ud-toast__msg { line-height: 1.4; letter-spacing: 0.01em; }

.toast-fade-enter-active { transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-fade-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }


/* ============================================
   HERO — 探索宣言区域
   ============================================ */
.ud-hero {
  position: relative;
  overflow: hidden;
  height: calc(100dvh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(30px);
}
.ud-hero--visible {
  opacity: 1;
  transform: translateY(0);
}

/* 浮动网格 Canvas */
.ud-hero__grid-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

/* 网格背景 */
.ud-hero__grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%);
}

/* 底部光晕 */
.ud-hero__glow {
  position: absolute;
  bottom: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(217, 119, 6, 0.07) 0%, transparent 70%);
  pointer-events: none;
}

.ud-hero__inner {
  position: relative;
  z-index: 2;
  max-width: 720px;
  text-align: center;
  width: 100%;
  padding: 80px 40px 60px;
  box-sizing: border-box;
}

/* 标签 */
.ud-hero__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  opacity: 0;
  animation: udFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
}
.ud-hero--visible .ud-hero__label { opacity: 1; }
.ud-hero__label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: udPulse 2s ease-in-out infinite;
}

@keyframes udPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* 超大标题 */
.ud-hero__title {
  font-family: var(--font-family-base);
  font-size: clamp(48px, 9vw, 96px);
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 0.92;
  letter-spacing: -0.035em;
  margin: 0 0 24px;
  display: flex;
  justify-content: center;
  gap: 0.22em;
  flex-wrap: wrap;
}

.ud-hero__word {
  display: inline-block;
  overflow: hidden;
}
.ud-hero__word-inner {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--word-i) * 0.1s + 0.3s);
}
.ud-hero--visible .ud-hero__word-inner {
  transform: translateY(0);
}

@keyframes udFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 副标题 */
.ud-hero__sub {
  font-size: clamp(15px, 1.6vw, 19px);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 44px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0;
  animation: udFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards;
}


/* ===== 搜索框 ===== */
.ud-search {
  max-width: 560px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 3px;
  opacity: 0;
  animation: udFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
}
.ud-search:hover {
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.03);
  border-color: var(--color-border);
}
.ud-search--focus {
  border-color: var(--color-accent);
  box-shadow: 0 8px 40px rgba(217, 119, 6, 0.1), 0 2px 8px rgba(15, 23, 42, 0.04);
  transform: scale(1.01);
}

.ud-search__icon {
  padding-left: 18px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  transition: color 0.3s;
}
.ud-search--focus .ud-search__icon { color: var(--color-accent); }

.ud-search__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 15px 8px;
  font-size: 15px;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  min-width: 0;
}
.ud-search__field::placeholder { color: var(--color-text-tertiary); }

.ud-search__btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 26px;
  background: var(--color-solid);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.3px;
}
.ud-search__btn:hover {
  background: var(--color-solid-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}
.ud-search__btn:active { transform: translateY(0); }


/* ===== 热门标签 ===== */
.ud-hero__tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 52px;
  opacity: 0;
  animation: udFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards;
}

.ud-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-light);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  letter-spacing: 0.02em;
}
.ud-tag:hover {
  color: var(--color-solid);
  border-color: var(--color-solid);
  background: rgba(15, 23, 42, 0.03);
  transform: translateY(-2px);
}


/* ===== 统计数字 ===== */
.ud-hero__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  opacity: 0;
  animation: udFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards;
}

.ud-stat { text-align: center; }
.ud-stat__num {
  display: block;
  font-family: var(--font-family-mono);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-solid);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ud-stat__lbl {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 4px;
}


/* ============================================
   主内容区域
   ============================================ */
.ud-content {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.ud-content--visible {
  opacity: 1;
  transform: translateY(0);
}

.ud-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}


/* ===== 自定义 Tab 导航 ===== */
.ud-tabs {
  display: flex;
  gap: 4px;
  position: relative;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 0;
}

.ud-tab {
  position: relative;
  padding: 16px 28px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-base);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  transition: color 0.3s ease;
  z-index: 1;
}
.ud-tab:hover { color: var(--color-text-secondary); }
.ud-tab--active { color: var(--color-solid); font-weight: 600; }

.ud-tab__line {
  position: absolute;
  bottom: -1px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--color-solid);
  border-radius: 2px 2px 0 0;
  animation: udTabLineIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes udTabLineIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}


/* ===== 筛选系统 ===== */
.ud-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 4px;
  margin-bottom: 32px;
}

.ud-filter__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ud-filter__key {
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  letter-spacing: 2px;
  text-transform: uppercase;
  min-width: 32px;
  flex-shrink: 0;
}

.ud-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  background: var(--color-background-alt);
  border: 1px solid var(--color-border-light);
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}
.ud-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-solid);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: inherit;
  z-index: 0;
}
.ud-chip:hover {
  border-color: var(--color-solid);
  color: var(--color-solid);
}
.ud-chip--on {
  color: var(--color-solid);
  border-color: var(--color-solid);
  background: rgba(15, 23, 42, 0.06);
}
.ud-chip--on::before {
  transform: scaleY(0);
}
.ud-chip span,
.ud-chip--on {
  position: relative;
  z-index: 1;
}

.ud-chip--sort {
  font-size: 10px;
  padding: 5px 12px;
  border-style: dashed;
}

.ud-filter__sorts {
  display: flex;
  gap: 6px;
  margin-left: auto;
}


/* ===== 工具栏 ===== */
.ud-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.ud-view-switch {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-background-alt);
  border-radius: 10px;
  border: 1px solid var(--color-border-light);
}

.ud-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ud-view-btn:hover { color: var(--color-text-secondary); background: var(--color-surface); }
.ud-view-btn--on {
  color: white;
  background: var(--color-solid);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
}

.ud-toolbar__count {
  font-size: 13px;
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
  letter-spacing: 0.02em;
}
.ud-toolbar__count em {
  font-style: normal;
  font-weight: 700;
  color: var(--color-solid);
  font-size: 15px;
}


/* ===== 过渡动画 ===== */
.ud-fade-enter-active,
.ud-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.ud-fade-enter-from,
.ud-fade-leave-to { opacity: 0; transform: translateY(8px); }


/* ============================================
   院校卡片网格
   ============================================ */
.ud-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 520px) { .ud-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px) { .ud-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1200px) { .ud-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1400px) { .ud-grid { grid-template-columns: repeat(4, 1fr); } }


/* ===== 院校卡片（Wow Moment 核心）===== */
.ud-card {
  --mx: 0deg;
  --my: 0deg;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.3s ease;
  will-change: transform;
  transform: perspective(900px) rotateX(var(--my)) rotateY(var(--mx));
}
.ud-card:hover {
  box-shadow:
    0 20px 50px -12px rgba(15, 23, 42, 0.15),
    0 8px 20px -8px rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.12);
}

/* 顶部强调色条 */
.ud-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ud-card:hover .ud-card__accent { height: 4px; }
.ud-card__accent--danger { background: linear-gradient(135deg, #DC2626, #EF4444); }
.ud-card__accent--warning { background: linear-gradient(135deg, #D97706, #F59E0B); }
.ud-card__accent--success { background: linear-gradient(135deg, #059669, #10B981); }
.ud-card__accent--info { background: linear-gradient(135deg, #0284C7, #38BDF8); }

.ud-card__body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ud-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.ud-card__name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  flex: 1;
  letter-spacing: -0.01em;
}

.ud-card__rank {
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 100px;
  flex-shrink: 0;
  color: white;
  letter-spacing: 0.02em;
}
.ud-card__rank--danger { background: #DC2626; }
.ud-card__rank--warning { background: #D97706; }
.ud-card__rank--success { background: #059669; }
.ud-card__rank--info { background: #0284C7; }

.ud-card__loc {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.ud-card__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.ud-card__major-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-slate-700);
}
.ud-card__major-icon {
  font-size: 8px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.ud-card__data {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding: 14px;
  background: var(--color-background-alt);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
}

.ud-data-cell {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 3px;
}
.ud-data-cell__lbl {
  font-family: var(--font-family-mono);
  font-size: 9px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.ud-data-cell__val {
  font-family: var(--font-family-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}
.ud-data-cell__val--low { color: #DC2626; }

.ud-card__foot {
  padding: 14px 24px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
}

.ud-card__action {
  font-family: var(--font-family-mono);
  font-weight: 600;
  font-size: 12px;
  padding: 7px 18px;
  border-radius: 8px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.03em;
}
.ud-card__action:hover {
  border-color: var(--color-solid);
  color: var(--color-solid);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}
.ud-card__action--added {
  background: rgba(5, 150, 105, 0.06);
  border-color: rgba(5, 150, 105, 0.3);
  color: #059669;
}


/* ===== 列表视图 ===== */
.ud-list-wrap {
  background: var(--color-surface);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.ud-table { width: 100%; border-radius: 16px; }
.ud-table :deep(.el-table__row) { cursor: pointer; transition: background-color 0.2s; }
.ud-table :deep(.el-table__row:hover) { background-color: var(--color-background-alt); }

.ud-list-name { display: flex; align-items: center; gap: 10px; }
.ud-list-name__txt { font-weight: 600; color: var(--color-text-primary); font-size: 14px; }
.ud-list-name__rank {
  flex-shrink: 0;
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  color: white;
}
.ud-list-name__rank--danger { background: #DC2626; }
.ud-list-name__rank--warning { background: #D97706; }
.ud-list-name__rank--success { background: #059669; }
.ud-list-name__rank--info { background: #0284C7; }

.ud-tbl-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
  margin-right: 6px;
  font-family: var(--font-family-mono);
  letter-spacing: 0.02em;
}
.ud-tbl-btn:hover { border-color: var(--color-solid); color: var(--color-solid); }
.ud-tbl-btn--primary { background: var(--color-solid); color: white; border-color: var(--color-solid); }
.ud-tbl-btn--primary:hover { background: var(--color-solid-hover); }
.ud-tbl-btn--added { background: rgba(5, 150, 105, 0.06); border-color: rgba(5, 150, 105, 0.3); color: #059669; }

.ud-rate--low { color: #DC2626; font-weight: 600; }


/* ===== 分页器 ===== */
.ud-pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.ud-pagination :deep(.el-pagination) {
  --el-pagination-button-bg-color: var(--color-surface);
}
.ud-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: var(--color-solid);
  border-radius: 6px;
}


/* ===== 空状态 ===== */
.ud-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}
.ud-empty__icon {
  color: var(--color-slate-300);
  margin-bottom: 24px;
  opacity: 0.6;
}
.ud-empty__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.ud-empty__desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 300px;
}


/* ============================================
   专业卡片
   ============================================ */
.ud-grid--majors { /* 继承 ud-grid */ }
.ud-grid--majors :deep(.el-checkbox-group) {
  display: contents;
}

.ud-major {
  --mx: 0deg;
  --my: 0deg;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  padding: 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.3s ease;
  will-change: transform;
  transform: perspective(900px) rotateX(var(--my)) rotateY(var(--mx));
}
.ud-major:hover {
  box-shadow:
    0 20px 50px -12px rgba(15, 23, 42, 0.15),
    0 8px 20px -8px rgba(15, 23, 42, 0.06),
    0 0 0 1px rgba(217, 119, 6, 0.08);
  border-color: rgba(15, 23, 42, 0.12);
}

.ud-major__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ud-major:hover .ud-major__accent { height: 5px; }

.ud-major--engineering .ud-major__accent { background: linear-gradient(135deg, #334155, #475569); }
.ud-major--business .ud-major__accent { background: linear-gradient(135deg, #059669, #10B981); }
.ud-major--social .ud-major__accent { background: linear-gradient(135deg, #D97706, #F59E0B); }
.ud-major--science .ud-major__accent { background: linear-gradient(135deg, #0284C7, #38BDF8); }
.ud-major--arts .ud-major__accent { background: linear-gradient(135deg, #DC2626, #EF4444); }
.ud-major--default .ud-major__accent { background: linear-gradient(135deg, #94A3B8, #CBD5E1); }

.ud-major__body { flex: 1; display: flex; flex-direction: column; }

.ud-major__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  height: 24px;
}

.ud-major__compare {
  position: absolute;
  top: 14px;
  left: 16px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: #fff;
  z-index: 2;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.ud-major__compare:hover { border-color: var(--color-accent); }
.ud-major__compare :deep(.el-checkbox) { margin: 0; }
.ud-major__compare :deep(.el-checkbox__input) { display: none; }
.ud-major__compare :deep(.el-checkbox__label) {
  padding-left: 0;
  display: block;
  width: 26px;
  height: 26px;
}
.ud-major__compare::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ud-major__compare:has(.el-checkbox.is-checked) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
  animation: ud-check-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ud-major__compare:has(.el-checkbox.is-checked)::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition-delay: 0.1s;
}
@keyframes ud-check-pop {
  0% { transform: scale(1); }
  35% { transform: scale(0.82); }
  70% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

.ud-major__body { flex: 1; display: flex; flex-direction: column; }

.ud-major__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  height: 24px;
  padding-left: 32px;
}

.ud-major__idx {
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  letter-spacing: 1.5px;
  opacity: 0.5;
}

.ud-major__cat {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.ud-major:hover .ud-major__cat {
  opacity: 1;
  color: var(--color-accent);
}

.ud-major__name {
  margin: 0 0 6px;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  padding-bottom: 10px;
}
.ud-major__name::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 32px;
  height: 2px;
  background: var(--color-accent);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 1px;
}
.ud-major:hover .ud-major__name::after {
  width: 56px;
}

.ud-major__name-cn {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.ud-major__name-en {
  font-size: 10px;
  font-weight: 400;
  font-style: italic;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-family-mono);
  letter-spacing: 0.02em;
  opacity: 0.7;
}

.ud-major__meta {
  margin: 0 0 14px;
  height: 22px;
  display: flex;
  align-items: center;
}

.ud-major__degree {
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  background: var(--color-background-alt);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
}

.ud-major__data {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding: 18px 14px 11px 20px;
  background: linear-gradient(135deg, #FAFBFC 0%, #F8FAFC 100%);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
  align-items: center;
}
.ud-major__data::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  background: var(--color-accent);
  border-radius: 2px;
  opacity: 0.7;
}
.ud-major__data .ud-data-cell:first-child {
  flex: 0.9;
}
.ud-major__data .ud-data-cell:last-child {
  flex: 1.1;
}
.ud-major__data .ud-data-cell {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ud-major__data .ud-data-cell__val {
  font-size: 12px;
  white-space: normal;
  word-break: break-all;
  line-height: 2.0;
}
.ud-data-cell--accent {
  color: var(--color-accent);
  font-weight: 800;
}

.ud-major__foot {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
  height: 36px;
  align-items: center;
}

.ud-major__action {
  font-family: var(--font-family-mono);
  font-weight: 700;
  font-size: 11px;
  padding: 8px 20px;
  border-radius: 8px;
  border: 1.5px solid var(--color-solid);
  background: var(--color-solid);
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.08em;
  display: inline-flex;
  align-items: center;
}
.ud-major__action:hover {
  background: var(--color-solid-hover);
  transform: translateY(-1px) translateX(2px);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
}


/* ===== 对比操作栏 ===== */
.ud-compare-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: var(--color-background-alt);
  border-radius: 16px;
  margin-top: 28px;
  border: 1px solid var(--color-border-light);
  flex-wrap: wrap;
  gap: 12px;
}
.ud-compare-bar__info {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
}
.ud-compare-bar__info strong { color: var(--color-solid); font-weight: 700; }

.ud-compare-bar__btn {
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.03em;
}
.ud-compare-bar__btn:hover { border-color: var(--color-solid); color: var(--color-solid); }
.ud-compare-bar__btn--primary {
  background: var(--color-solid);
  color: white;
  border-color: var(--color-solid);
}
.ud-compare-bar__btn--primary:hover { background: var(--color-solid-hover); }

.ud-compare-wrap { overflow-x: auto; }
.ud-compare-table :deep(.el-table__cell) { overflow: hidden; }
.ud-compare-table :deep(.el-table__body .cell) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }


/* ===== 自定义对比模态框 ===== */
.ud-modal {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ud-modal__box {
  width: min(88vw, 1100px);
  max-height: calc(100dvh - 60px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 32px 80px -16px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  overflow: hidden;
}

/* 头部 */
.ud-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  border-bottom: 1px solid var(--color-border-lighter);
  flex-shrink: 0;
}
.ud-modal__head-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.ud-modal__num {
  font-family: var(--font-family-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--color-accent);
  text-transform: uppercase;
}
.ud-modal__title {
  font-family: var(--font-family-base);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}
.ud-modal__count {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-tertiary);
  padding: 3px 10px;
  background: var(--color-background-alt);
  border-radius: 100px;
}

.ud-modal__close {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}
.ud-modal__close:hover {
  border-color: var(--color-solid);
  color: var(--color-solid);
  background: rgba(15, 23, 42, 0.04);
  transform: rotate(90deg);
}

/* 内容区 */
.ud-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  overscroll-behavior: contain;
}

/* 底部 */
.ud-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 28px;
  border-top: 1px solid var(--color-border-lighter);
  flex-shrink: 0;
}

/* 模态框按钮 */
.ud-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.ud-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
}
.ud-btn--ghost:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
  background: var(--color-background-alt);
}
.ud-btn--primary {
  background: var(--color-solid);
  color: white;
  border: 1px solid var(--color-solid);
}
.ud-btn--primary:hover {
  background: var(--color-solid-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
}

/* 模态框过渡动画 */
.ud-modal-enter-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.ud-modal-enter-active .ud-modal__box {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
}
.ud-modal-leave-active {
  transition: opacity 0.2s ease;
}
.ud-modal-leave-active .ud-modal__box {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.ud-modal-enter-from,
.ud-modal-leave-to { opacity: 0; }
.ud-modal-enter-from .ud-modal__box {
  transform: scale(0.95) translateY(16px);
  opacity: 0;
}
.ud-modal-leave-to .ud-modal__box {
  transform: scale(0.98) translateY(8px);
  opacity: 0;
}


/* ===== 内联微型搜索 ===== */
.ud-micro-search {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  margin-left: auto;
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: 100px;
  transition: all 0.3s ease;
}
.ud-micro-search:focus-within {
  border-color: var(--color-slate-300);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}
.ud-micro-search__icon { color: var(--color-text-tertiary); flex-shrink: 0; }
.ud-micro-search__field {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--color-text-primary);
  width: 110px;
  font-family: var(--font-family-base);
}
.ud-micro-search__field::placeholder { color: var(--color-text-tertiary); }


/* ============================================
   响应式设计
   ============================================ */
@media (max-width: 1199px) {
  .ud-container { padding: 0 28px; }
  .ud-hero { height: calc(100dvh - 56px); margin-top: -14px; }
  .ud-hero__inner { padding: 70px 28px 50px; }
  .ud-hero__stats { gap: 32px; }
}

@media (max-width: 767px) {
  .ud-hero { height: calc(100dvh - 52px); margin-top: -10px; }
  .ud-hero__inner { padding: 60px 20px 40px; }
  .ud-container { padding: 0 20px; }
  .ud-hero__title { font-size: clamp(36px, 10vw, 56px); }
  .ud-hero__sub { font-size: 14px; margin-bottom: 32px; }
  .ud-search { max-width: 100%; }
  .ud-search__btn { padding: 10px 18px; font-size: 13px; }
  .ud-hero__stats { gap: 24px; flex-wrap: wrap; }
  .ud-stat__num { font-size: 26px; }
  .ud-hero__tags { gap: 6px; margin-bottom: 36px; }
  .ud-tag { font-size: 11px; padding: 4px 12px; }
  .ud-filters { padding: 16px 0; gap: 10px; }
  .ud-filter__row { gap: 6px; }
  .ud-chip { padding: 5px 12px; font-size: 11px; }
  .ud-filter__key { display: none; }
  .ud-micro-search { margin-left: 0; width: 100%; }
  .ud-micro-search__field { width: auto; flex: 1; }
  .ud-toolbar { flex-direction: column; align-items: flex-start; gap: 12px; }
  .ud-tabs { gap: 0; }
  .ud-tab { padding: 14px 20px; font-size: 15px; }
  .ud-card__body { padding: 20px; }
  .ud-card__name { font-size: 15px; }
  .ud-card__data { padding: 12px; gap: 10px; }
  .ud-major { padding: 20px; }
}

@media (max-width: 576px) {
  .ud-hero__title { font-size: clamp(32px, 11vw, 48px); gap: 0.15em; }
  .ud-hero__label { font-size: 10px; letter-spacing: 2px; }
  .ud-hero__stats { flex-direction: column; gap: 16px; align-items: center; }
  .ud-stat { text-align: center; }
  .ud-pager :deep(.el-pagination__total) { display: none; }
  .ud-pager :deep(.el-pagination__sizes) { display: none; }
  .ud-pager :deep(.el-pagination__jump) { display: none; }
  .ud-compare-bar { flex-direction: column; align-items: stretch; text-align: center; }
  .ud-compare-bar__btn { width: 100%; }
  .ud-compare-table :deep(.el-table__body .cell) { white-space: normal !important; text-overflow: unset !important; overflow: visible !important; }
  .ud-compare-table :deep(.el-table__cell) { overflow: visible !important; }
}

@media (max-width: 1024px) {
  .ud-modal__box { width: 94vw; max-height: calc(100dvh - 40px); }
}

@media (max-width: 768px) {
  .ud-modal__box { width: 96vw; max-height: calc(100dvh - 32px); border-radius: 16px; }
  .ud-modal__head { padding: 16px 20px; flex-wrap: wrap; gap: 8px; }
  .ud-modal__body { padding: 16px 20px; }
  .ud-modal__foot { padding: 14px 20px; gap: 10px; }
}

@media (max-width: 480px) {
  .ud-modal__box { width: 97vw; max-height: calc(100dvh - 24px); border-radius: 14px; }
  .ud-modal__head { padding: 14px 16px; }
  .ud-modal__body { padding: 12px 16px; }
  .ud-modal__foot { padding: 12px 16px; flex-direction: column-reverse; gap: 8px; }
  .ud-modal__foot .ud-btn { width: 100%; justify-content: center; }
  .ud-compare-table { font-size: 12px; }
  .ud-compare-table :deep(.el-table__header th) { font-size: 11px; padding: 8px 6px; }
  .ud-compare-table :deep(.el-table__body td) { padding: 6px 4px; font-size: 12px; }
}

/* Toast 移动端适配 */
@media (max-width: 767px) {
  .ud-toast { left: 16px; right: 16px; transform: none; border-radius: 12px; }
  .ud-toast-fade-enter-from { transform: translateY(-16px); }
  .ud-toast-fade-leave-to { transform: translateY(-8px); }
  .ud-toast__msg { white-space: normal; font-size: 13px; }
}


/* ===== 减少动画偏好 ===== */
@media (prefers-reduced-motion: reduce) {
  .ud-hero,
  .ud-content { transition: opacity 0.3s ease; opacity: 1; transform: none; }
  .ud-hero__word-inner { transform: none; transition: none; }
  .ud-card,
  .ud-major { transition: box-shadow 0.2s ease, border-color 0.2s ease; transform: none !important; }
  .ud-card:hover,
  .ud-major:hover { transform: none; }
  .ud-chip::before { transition: none; }
  .ud-tag:hover { transform: none; }
  .ud-card__action:hover { transform: none; }
  .ud-major__action:hover { transform: none; }
  .ud-search--focus { transform: none; }
  .ud-search__btn:hover { transform: none; }
  .ud-hero__label,
  .ud-search,
  .ud-hero__tags,
  .ud-hero__stats,
  .ud-tab__line { animation: none; opacity: 1; }
  .ud-hero__label-dot { animation: none; }
  .toast-fade-enter-active,
  .toast-fade-leave-active { transition-duration: 0.01ms; }
}
</style>
