const FORMULAS = [
  // === Expected Value & Core Probability ===
  { id: "F1", name: "Law of Total Expectations", formula: "E[X] = Σ E[X|Aᵢ]·P(Aᵢ)", category: "Expected Value & Core Probability" },
  { id: "F2", name: "Law of Total Probability", formula: "P(A) = Σ P(A|Bᵢ)·P(Bᵢ)", category: "Expected Value & Core Probability" },
  { id: "F3", name: "Bayes' Rule", formula: "P(A|B) = P(B|A)·P(A) / P(B)", category: "Expected Value & Core Probability" },
  { id: "F4", name: "Complement Rule", formula: "P(A) = 1 − P(Aᶜ)", category: "Expected Value & Core Probability" },
  { id: "F5", name: "Inclusion-Exclusion", formula: "P(A∪B) = P(A)+P(B)−P(A∩B)", category: "Expected Value & Core Probability" },
  { id: "F6", name: "Independence", formula: "P(A∩B) = P(A)·P(B)", category: "Expected Value & Core Probability" },
  { id: "F7", name: "Conditional Probability", formula: "P(A|B) = P(A∩B)/P(B)", category: "Expected Value & Core Probability" },

  // === Counting & Combinatorics ===
  { id: "F8", name: "Permutations", formula: "P(n,k) = n!/(n−k)!", category: "Counting & Combinatorics" },
  { id: "F9", name: "Combinations", formula: "C(n,k) = n!/[k!(n−k)!]", category: "Counting & Combinatorics" },
  { id: "F10", name: "Binomial Theorem", formula: "(a+b)ⁿ = Σ C(n,k)aⁿ⁻ᵏbᵏ", category: "Counting & Combinatorics" },
  { id: "F11", name: "Stars and Bars", formula: "C(n+k−1, k−1)", category: "Counting & Combinatorics" },
  { id: "F12", name: "Circular Permutations", formula: "(n−1)!", category: "Counting & Combinatorics" },
  { id: "F13", name: "Multinomial Coefficient", formula: "n!/(n₁!·n₂!·…·nₖ!)", category: "Counting & Combinatorics" },
  { id: "F14", name: "Stirling's Approximation", formula: "n! ≈ √(2πn)(n/e)ⁿ", category: "Counting & Combinatorics" },

  // === Recursive Expectations ===
  { id: "F15", name: "Coupon Collector", formula: "E = n·Hₙ = n·Σ(1/k)", category: "Recursive Expectations" },
  { id: "F16", name: "Geometric Distribution", formula: "E[X] = 1/p, Var = (1−p)/p²", category: "Recursive Expectations" },
  { id: "F17", name: "Consecutive Runs Recurrence", formula: "Eᵢ = 1 + p·Eᵢ₊₁ + (1−p)·E₀", category: "Recursive Expectations" },

  // === Distributions ===
  { id: "F18", name: "Binomial Distribution", formula: "P(X=k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ; E=np, Var=np(1−p)", category: "Distributions" },
  { id: "F19", name: "Poisson Distribution", formula: "P(X=k) = e⁻λλᵏ/k!; E=λ, Var=λ", category: "Distributions" },
  { id: "F20", name: "Normal PDF & z-scores", formula: "1σ=68%, 2σ=95.4%, 3σ=99.7%", category: "Distributions" },
  { id: "F21", name: "Central Limit Theorem", formula: "X̄ ~ N(μ, σ²/n)", category: "Distributions" },
  { id: "F22", name: "Uniform Distribution", formula: "E=(a+b)/2, Var=(b−a)²/12", category: "Distributions" },
  { id: "F23", name: "Exponential Distribution", formula: "E=1/λ, Var=1/λ²; memoryless", category: "Distributions" },
  { id: "F24", name: "Normal MGF", formula: "M(t) = exp(μt + σ²t²/2)", category: "Distributions" },
  { id: "F25", name: "Linear Combo of Normals", formula: "aX+bY ~ N(aμₓ+bμᵧ, a²σₓ²+b²σᵧ²)", category: "Distributions" },
  { id: "F26", name: "Zero-Mean Normal Symmetry", formula: "P(W>0) = 1/2", category: "Distributions" },
  { id: "F27", name: "Conditional Normal", formula: "X|X+Y=c ~ N(c/2, 1/2) for iid N(0,1)", category: "Distributions" },

  // === Order Statistics ===
  { id: "F28", name: "CDF of Min", formula: "F_min(x) = 1−[1−F(x)]ⁿ", category: "Order Statistics" },
  { id: "F29", name: "CDF of Max", formula: "F_max(x) = [F(x)]ⁿ", category: "Order Statistics" },

  // === Variance, Covariance & Correlation ===
  { id: "F30", name: "Variance", formula: "Var(X) = E[X²] − (E[X])²", category: "Variance, Covariance & Correlation" },
  { id: "F31", name: "Var of Linear Combo", formula: "Var(aX+bY) = a²Var(X) + b²Var(Y) + 2ab·Cov(X,Y)", category: "Variance, Covariance & Correlation" },
  { id: "F32", name: "Covariance", formula: "Cov(X,Y) = E[XY] − E[X]E[Y]", category: "Variance, Covariance & Correlation" },
  { id: "F33", name: "Linearity of Covariance", formula: "Cov(X, ΣcᵢYᵢ) = ΣcᵢCov(X,Yᵢ)", category: "Variance, Covariance & Correlation" },
  { id: "F34", name: "Correlation", formula: "ρ = Cov(X,Y)/(σₓσᵧ), bounded [−1,1]", category: "Variance, Covariance & Correlation" },
  { id: "F35", name: "Var(X+Y) bounds", formula: "(a−b)² ≤ Var ≤ (a+b)²", category: "Variance, Covariance & Correlation" },
  { id: "F36", name: "Zero Cov ≠ Independence", formula: "Zero Cov ≠ Independence", category: "Variance, Covariance & Correlation" },
  { id: "F37", name: "Annualizing Volatility", formula: "σ_annual = σ_daily × √252", category: "Variance, Covariance & Correlation" },

  // === Covariance Matrices & Linear Algebra ===
  { id: "F38", name: "Covariance Matrix is PSD", formula: "y'Σy = Var(Σyᵢxᵢ) ≥ 0", category: "Covariance Matrices & Linear Algebra" },
  { id: "F39", name: "Correlation Matrix is PSD", formula: "R = S⁻¹ΣS⁻¹", category: "Covariance Matrices & Linear Algebra" },
  { id: "F40", name: "Determinant test for consistent correlations", formula: "det(R) ≥ 0", category: "Covariance Matrices & Linear Algebra" },
  { id: "F41", name: "Product of Cov Matrices", formula: "AB valid iff AB=BA", category: "Covariance Matrices & Linear Algebra" },
  { id: "F42", name: "Random Binary Matrix P(non-singular)", formula: "Π(1−1/2ᵏ)", category: "Covariance Matrices & Linear Algebra" },

  // === Gambler's Ruin ===
  { id: "F43", name: "Fair Gambler's Ruin", formula: "Pᵢ = i/N", category: "Gambler's Ruin" },
  { id: "F44", name: "Biased Gambler's Ruin", formula: "Pᵢ = [1−(q/p)ⁱ]/[1−(q/p)ᴺ]", category: "Gambler's Ruin" },

  // === Series & Summation ===
  { id: "F45", name: "Arithmetic Sum", formula: "Σk = n(n+1)/2", category: "Series & Summation" },
  { id: "F46", name: "Sum of Squares", formula: "Σk² = n(n+1)(2n+1)/6", category: "Series & Summation" },
  { id: "F47", name: "Geometric Series (finite)", formula: "Σrᵏ = (1−rⁿ⁺¹)/(1−r)", category: "Series & Summation" },
  { id: "F48", name: "Geometric Series (infinite)", formula: "Σrᵏ = 1/(1−r)", category: "Series & Summation" },
  { id: "F49", name: "Consecutive Summation / Stack-and-Pair Trick", formula: "Stack-and-Pair: pair terms from opposite ends", category: "Series & Summation" },

  // === OLS & Econometrics ===
  { id: "F50", name: "OLS Estimator", formula: "β̂ = (X'X)⁻¹X'Y", category: "OLS & Econometrics" },
  { id: "F51", name: "1D OLS", formula: "b = Cov(X,Y)/Var(X) = ρσᵧ/σₓ", category: "OLS & Econometrics" },
  { id: "F52", name: "R-squared", formula: "R² = 1 − SSR/SST = Var(Ŷ)/Var(Y) = [Corr(Y,Ŷ)]²", category: "OLS & Econometrics" },
  { id: "F53", name: "OLS Properties", formula: "Σεᵢ=0, X'ε=0, Cov(Ŷ,ε)=0", category: "OLS & Econometrics" },
  { id: "F54", name: "Bias-Variance Tradeoff", formula: "Bias-Variance Tradeoff / Regularization", category: "OLS & Econometrics" },

  // === Strategy & Optimal Stopping ===
  { id: "F55", name: "Optimal Stopping", formula: "threshold x* via dE/dx = 0", category: "Strategy & Optimal Stopping" },
  { id: "F56", name: "Nash Equilibrium", formula: "Nash Equilibrium / Symmetric Game Setup", category: "Strategy & Optimal Stopping" },
  { id: "F57", name: "Dynamic Programming", formula: "Backward induction from terminal states", category: "Strategy & Optimal Stopping" },
  { id: "F58", name: "Deuce Formula", formula: "P(win) = p²/(p²+(1−p)²)", category: "Strategy & Optimal Stopping" },

  // === Symmetry ===
  { id: "F59", name: "Symmetry of Medians", formula: "Complement Pairing", category: "Symmetry" },
  { id: "F60", name: "Circular Symmetry", formula: "P(triangle contains center) = 1/4", category: "Symmetry" },

  // === Pigeonhole ===
  { id: "F61", name: "Pigeonhole Principle", formula: "min items = n(k−1)+1", category: "Pigeonhole" },

  // === MLE ===
  { id: "F62", name: "MLE", formula: "maximize L(θ) = Πf(xᵢ|θ)", category: "MLE" },
  { id: "F63", name: "Discrete Uniform MLE", formula: "N̂ = max(data)", category: "MLE" },

  // === Calculus ===
  { id: "F64", name: "Integration by Parts", formula: "∫u dv = uv − ∫v du", category: "Calculus" },
  { id: "F65", name: "L'Hôpital's Rule", formula: "lim f/g = lim f'/g'", category: "Calculus" },

  // === Finance ===
  { id: "F66", name: "Risk-Free Portfolio (ρ=−1)", formula: "wₐ = σ_b/(σₐ+σ_b)", category: "Finance" },
  { id: "F67", name: "Fair Option Pricing", formula: "E[profit] = 0", category: "Finance" },

  // === Miscellaneous ===
  { id: "F68", name: "Digit Sum Trick", formula: "uniform digits, E[sum] = n×4.5", category: "Miscellaneous" },
  { id: "F69", name: "Divisibility Rules", formula: "Divisibility Rules (11, 22, etc.)", category: "Miscellaneous" },
  { id: "F70", name: "Hot Hand / Belvedere", formula: "P(k of N) = 1/(N+1) uniform", category: "Miscellaneous" },
  { id: "F71", name: "Drunk Passenger", formula: "P(last gets own seat) = 1/2", category: "Miscellaneous" },
];

const CATEGORIES = [...new Set(FORMULAS.map(f => f.category))];
