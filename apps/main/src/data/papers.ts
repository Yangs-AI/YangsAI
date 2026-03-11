import type { VenueKey } from "./venueMap";

export interface PaperAuthor {
  name: string;
  // Optional per-paper explicit profile/homepage link.
  // Priority: author.url > authorLinks[name] > member auto-link.
  url?: string;
  isFirstAuthor?: boolean;
  isCorrespondingAuthor?: boolean;
}

// Optional global author links. Configure once by author name instead of repeating in each paper.
// The key matching is case-insensitive and whitespace-insensitive in rendering.
export const authorLinks: Record<string, string> = {
  "Zhengxin Yang": "https://jason-young.me/",
  "Jianfeng Zhan": "https://www.zhanjianfeng.org/",
};

export interface PaperEntry {
  id: string;
  title: string;
  venue: VenueKey;
  publishedOn: string;
  authors: PaperAuthor[];
  bibtex?: string;
  paperUrl?: string;
  codeUrl?: string;
  selected?: boolean;
}

// Keep this list as the single source of truth for paper pages.
export const papers: PaperEntry[] = [
  {
    id: "probing-memes-entangled-evaluation-world",
    title: "Probing Memes in LLMs: A Paradigm for the Entangled Evaluation World",
    venue: "Preprint",
    publishedOn: "2026-02-03",
    authors: [
      { name: "Luzhou Peng", isFirstAuthor: true },
      { name: "Zhengxin Yang", isCorrespondingAuthor: true },
      { name: "Honglu Ji" },
      { name: "Yikang Yang" },
      { name: "Fanda Fan" },
      { name: "Wanling Gao" },
      { name: "Jiayuan Ge" },
      { name: "Yilin Han" },
      { name: "Jianfeng Zhan" },
    ],
    paperUrl: "https://arxiv.org/abs/2603.04408",
    bibtex: `@misc{peng2026probingmemesllmsparadigm,
      title={Probing Memes in LLMs: A Paradigm for the Entangled Evaluation World}, 
      author={Luzhou Peng and Zhengxin Yang and Honglu Ji and Yikang Yang and Fanda Fan and Wanling Gao and Jiayuan Ge and Yilin Han and Jianfeng Zhan},
      year={2026},
      eprint={2603.04408},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2603.04408}, 
}`,
    selected: true,
  },
  {
    id: "grade-graph-diffusion-estimator",
    title: "GraDE: A Graph Diffusion Estimator for Frequent Subgraph Discovery in Neural Architectures",
    venue: "Preprint",
    publishedOn: "2026-02-03",
    authors: [
      { name: "Yikang Yang", isFirstAuthor: true },
      { name: "Zhengxin Yang", isCorrespondingAuthor: true },
      { name: "Minghao Luo" },
      { name: "Luzhou Peng" },
      { name: "Hongxiao Li" },
      { name: "Wanling Gao" },
      { name: "Lei Wang" },
      { name: "Jianfeng Zhan" },
    ],
    paperUrl: "https://www.arxiv.org/abs/2602.03257",
    bibtex: `@misc{yang2026gradegraphdiffusionestimator,
      title={GraDE: A Graph Diffusion Estimator for Frequent Subgraph Discovery in Neural Architectures}, 
      author={Yikang Yang and Zhengxin Yang and Minghao Luo and Luzhou Peng and Hongxiao Li and Wanling Gao and Lei Wang and Jianfeng Zhan},
      year={2026},
      eprint={2602.03257},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2602.03257}, 
}`,
    selected: true,
  },
  {
    id: "time-mosaic",
    title: "TimeMosaic: Temporal Heterogeneity Guided Time Series Forecasting via Adaptive Granularity Patch and Segment-wise Decoding",
    venue: "AAAI",
    publishedOn: "2026-02",
    authors: [
      { name: "Kuiye Ding", isFirstAuthor: true },
      { name: "Fanda Fan", isCorrespondingAuthor: true },
      { name: "Chunyi Hou" },
      { name: "Zheya Wang" },
      { name: "Lei Wang" },
      { name: "Zhengxin Yang" },
      { name: "Jianfeng Zhan" }
    ],
    paperUrl: "https://openreview.net/forum?id=R4XXeYW4DW",
    bibtex: `@inproceedings{ding2026timemosaic,
      title={TimeMosaic: Temporal Heterogeneity Guided Time Series Forecasting via Adaptive Granularity Patch and Segment-wise Decoding},
      author={Kuiye Ding and Fanda Fan and Chunyi Hou and Zheya Wang and Lei Wang and Zhengxin Yang and Jianfeng Zhan},
      booktitle={Proceedings of the AAAI Conference on Artificial Intelligence},
      year={2026}
    }`,
  },
  {
    id: "evaluatology-science-and-engineering",
    title: "Evaluatology: The Science and Engineering of Evaluation",
    venue: "TBench",
    publishedOn: "2024-04-30",
    authors: [
      { name: "Jianfeng Zhan", isFirstAuthor: true },
      { name: "Lei Wang" },
      { name: "Wanling Gao" },
      { name: "Hongxiao Li" },
      { name: "Chenxi Wang" },
      { name: "Yunyou Huang" },
      { name: "Yatao Li" },
      { name: "Zhengxin Yang" },
      { name: "Guoxin Kang" },
      { name: "Chunjie Luo" },
      { name: "Hainan Ye" },
      { name: "Shaopeng Dai" },
      { name: "Zhifei Zhang" },
    ],
    paperUrl: "https://www.sciencedirect.com/science/article/pii/S2772485924000140",
    bibtex: `@article{ZHAN2024100162,
title = {Evaluatology: The science and engineering of evaluation},
journal = {BenchCouncil Transactions on Benchmarks, Standards and Evaluations},
volume = {4},
number = {1},
pages = {100162},
year = {2024},
issn = {2772-4859},
doi = {https://doi.org/10.1016/j.tbench.2024.100162},
url = {https://www.sciencedirect.com/science/article/pii/S2772485924000140},
author = {Jianfeng Zhan and Lei Wang and Wanling Gao and Hongxiao Li and Chenxi Wang and Yunyou Huang and Yatao Li and Zhengxin Yang and Guoxin Kang and Chunjie Luo and Hainan Ye and Shaopeng Dai and Zhifei Zhang}
}`,
    selected: true,
  },
  {
    id: "algorithmic-fairness-social-context",
    title: "Algorithmic Fairness in Social Context",
    venue: "TBench",
    publishedOn: "2023-08-24",
    authors: [
      { name: "Yunyou Huang", isFirstAuthor: true },
      { name: "Wenjing Liu" },
      { name: "Wanling Gao" },
      { name: "Xiangjiang Lu" },
      { name: "Xiaoshuang Liang" },
      { name: "Zhengxin Yang" },
      { name: "Hongxiao Li" },
      { name: "Li Ma" },
      { name: "Suqing Tang", isCorrespondingAuthor: true },
    ],
    paperUrl: "https://www.sciencedirect.com/science/article/pii/S2772485923000546",
    bibtex: `@article{HUANG2023100137,
title = {Algorithmic fairness in social context},
journal = {BenchCouncil Transactions on Benchmarks, Standards and Evaluations},
volume = {3},
number = {3},
pages = {100137},
year = {2023},
issn = {2772-4859},
doi = {https://doi.org/10.1016/j.tbench.2023.100137},
url = {https://www.sciencedirect.com/science/article/pii/S2772485923000546},
author = {Yunyou Huang and Wenjing Liu and Wanling Gao and Xiangjiang Lu and Xiaoshuang Liang and Zhengxin Yang and Hongxiao Li and Li Ma and Suqin Tang}
}`,
  },
  {
    id: "quality-tail-ml-inference",
    title: "Quality at the Tail of Machine Learning Inference",
    venue: "Preprint",
    publishedOn: "2025-01-01",
    authors: [
      { name: "Zhengxin Yang", isFirstAuthor: true },
      { name: "Wanling Gao" },
      { name: "Chunjie Luo" },
      { name: "Lei Wang" },
      { name: "Fei Tang" },
      { name: "Xu Wen" },
      { name: "Jianfeng Zhan", isCorrespondingAuthor: true },
    ],
    paperUrl: "https://arxiv.org/abs/2212.13925",
    bibtex: `@misc{yang2024qualitytailmachinelearning,
      title={Quality at the Tail of Machine Learning Inference}, 
      author={Zhengxin Yang and Wanling Gao and Chunjie Luo and Lei Wang and Fei Tang and Xu Wen and Jianfeng Zhan},
      year={2024},
      eprint={2212.13925},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2212.13925}, 
}`,
  },
  {
    id: "evaluatology-perspective-ai-evaluation-critical-scenarios",
    title: "Evaluatology's perspective on AI evaluation in critical scenarios: From tail quality to landscape",
    venue: "TBench",
    publishedOn: "2025-04-28",
    authors: [{ name: "Zhengxin Yang", isFirstAuthor: true }],
    paperUrl: "https://www.sciencedirect.com/science/article/pii/S277248592500016X",
    bibtex: `@article{YANG2025100203,
title = {Evaluatology's perspective on AI evaluation in critical scenarios: From tail quality to landscape},
journal = {BenchCouncil Transactions on Benchmarks, Standards and Evaluations},
volume = {5},
number = {1},
pages = {100203},
year = {2025},
issn = {2772-4859},
doi = {https://doi.org/10.1016/j.tbench.2025.100203},
url = {https://www.sciencedirect.com/science/article/pii/S277248592500016X},
author = {Zhengxin Yang},
keywords = {Tail Quality, Evaluatology, AI inference},
}`,
    selected: true,
  },
  {
    id: "artificial-intelligence-designed-artificial-intelligence",
    title: "Artificial Intelligence Designed Artificial Intelligence",
    venue: "Preprint",
    publishedOn: "2025-09-06",
    authors: [{ name: "Zhengxin Yang", isFirstAuthor: true }],
    paperUrl: "https://hal.science/hal-05243279",
    bibtex: `@unpublished{yang:hal-05243279,
  TITLE = {{Artificial Intelligence Designed Artificial Intelligence}},
  AUTHOR = {Yang, Zhengxin},
  URL = {https://hal.science/hal-05243279},
  NOTE = {working paper or preprint},
  YEAR = {2025},
  MONTH = Sep,
  KEYWORDS = {AIDAI ; AI-Designed AI ; AI-Centered},
  PDF = {https://hal.science/hal-05243279v1/file/aidai.pdf},
  HAL_ID = {hal-05243279},
  HAL_VERSION = {v1},
}`,
    selected: true,
  },
  {
    id: "younger-first-dataset-aigc-architecture",
    title: "Younger: The First Dataset for Artificial Intelligence-Generated Neural Network Architecture",
    venue: "Preprint",
    publishedOn: "2024-06-20",
    authors: [
      { name: "Zhengxin Yang", isFirstAuthor: true },
      { name: "Wanling Gao" },
      { name: "Luzhou Peng" },
      { name: "Yunyou Huang" },
      { name: "Fei Tang" },
      { name: "Jianfeng Zhan" },
    ],
    paperUrl: "https://arxiv.org/abs/2406.15132",
    bibtex: `@misc{yang2024youngerdatasetartificialintelligencegenerated,
      title={Younger: The First Dataset for Artificial Intelligence-Generated Neural Network Architecture}, 
      author={Zhengxin Yang and Wanling Gao and Luzhou Peng and Yunyou Huang and Fei Tang and Jianfeng Zhan},
      year={2024},
      eprint={2406.15132},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2406.15132}, 
}`,
    selected: true,
  },
  {
    id: "big-medical-data-medical-ai-standards",
    title: "Big Medical Data and Medical AI Standards: Status Quo, Opportunities and Challenges",
    venue: "XHYXZZ",
    publishedOn: "2021-08-23",
    authors: [
      { name: "Zhifei Zhang", isFirstAuthor: true },
      { name: "Zhengxin Yang" },
      { name: "Yunyou Huang", isCorrespondingAuthor: true },
      { name: "Jianfeng Zhan", isCorrespondingAuthor: true },
    ],
    paperUrl: "https://xhyxzz.pumch.cn/cn/article/doi/10.12290/xhyxzz.2021-0472",
    bibtex: `@Article{1674-9081(2021)05-0614-07,
title = {医学大数据与人工智能标准体系：现状、机遇与挑战},
journal = {协和医学杂志},
volume = {12},
number = {5},
pages = {614-620},
year = {2021},
issn = {1674-9081},
doi = {10.12290/xhyxzz.2021-0472},
url = {https://xhyxzz.pumch.cn/cn/article/doi/10.12290/xhyxzz.2021-0472},
author = {张知非 and 杨郑鑫 and 黄运有 and 詹剑锋}
}`,
  },
  {
    id: "guiding-teacher-forcing-with-seer-forcing",
    title: "Guiding Teacher Forcing with Seer Forcing for Neural Machine Translation",
    venue: "ACL",
    publishedOn: "2021-08-01",
    authors: [
      { name: "Yang Feng", isFirstAuthor: true },
      { name: "Shuhao Gu" },
      { name: "Dengji Guo" },
      { name: "Zhengxin Yang" },
      { name: "Chenze Shao" },
    ],
    paperUrl: "https://aclanthology.org/2021.acl-long.223/",
    bibtex: `@inproceedings{feng-etal-2021-guiding,
    title = "Guiding Teacher Forcing with Seer Forcing for Neural Machine Translation",
    author = "Feng, Yang  and
      Gu, Shuhao  and
      Guo, Dengji  and
      Yang, Zhengxin  and
      Shao, Chenze",
    editor = "Zong, Chengqing  and
      Xia, Fei  and
      Li, Wenjie  and
      Navigli, Roberto",
    booktitle = "Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers)",
    month = aug,
    year = "2021",
    address = "Online",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2021.acl-long.223/",
    doi = "10.18653/v1/2021.acl-long.223",
    pages = "2862--2872"
}`,
  },
  {
    id: "modeling-fluency-faithfulness-diverse-nmt",
    title: "Modeling Fluency and Faithfulness for Diverse Neural Machine Translation",
    venue: "AAAI",
    publishedOn: "2020-04-03",
    authors: [
      { name: "Yang Feng", isFirstAuthor: true },
      { name: "Wanying Xie" },
      { name: "Shuhao Gu" },
      { name: "Chenze Shao" },
      { name: "Wen Zhang" },
      { name: "Zhengxin Yang" },
      { name: "Dong Yu" },
    ],
    paperUrl: "https://ojs.aaai.org/index.php/AAAI/article/view/5334",
    bibtex: `@article{Feng_Xie_Gu_Shao_Zhang_Yang_Yu_2020, title={Modeling Fluency and Faithfulness for Diverse Neural Machine Translation }, volume={34}, url={https://ojs.aaai.org/index.php/AAAI/article/view/5334}, DOI={10.1609/aaai.v34i01.5334}, number={01}, journal={Proceedings of the AAAI Conference on Artificial Intelligence}, author={Feng, Yang and Xie, Wanying and Gu, Shuhao and Shao, Chenze and Zhang, Wen and Yang, Zhengxin and Yu, Dong}, year={2020}, month={Apr.}, pages={59-66} }`,
  },
  {
    id: "query-guided-capsule-document-translation",
    title: "Enhancing Context Modeling with a Query-Guided Capsule Network for Document-level Translation",
    venue: "EMNLP",
    publishedOn: "2019-11-03",
    authors: [
      { name: "Zhengxin Yang", isFirstAuthor: true },
      { name: "Jinchao Zhang" },
      { name: "Fandong Meng" },
      { name: "Shuhao Gu" },
      { name: "Yang Feng" },
      { name: "Jie Zhou" },
    ],
    paperUrl: "https://aclanthology.org/D19-1164/",
    bibtex: `@inproceedings{yang-etal-2019-enhancing,
    title = "Enhancing Context Modeling with a Query-Guided Capsule Network for Document-level Translation",
    author = "Yang, Zhengxin  and
      Zhang, Jinchao  and
      Meng, Fandong  and
      Gu, Shuhao  and
      Feng, Yang  and
      Zhou, Jie",
    editor = "Inui, Kentaro  and
      Jiang, Jing  and
      Ng, Vincent  and
      Wan, Xiaojun",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP)",
    month = nov,
    year = "2019",
    address = "Hong Kong, China",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/D19-1164/",
    doi = "10.18653/v1/D19-1164",
    pages = "1527--1537"
}`,
    selected: true,
  },
  {
    id: "uyghur-chinese-nmt-incremental-training",
    title: "Uyghur-to-Chinese Neural Machine Translation Based on Incremental Training",
    venue: "JXMU",
    publishedOn: "2019-03-28",
    paperUrl: "http://dx.doi.org/10.6043/j.issn.0438-0479.201811019",
    authors: [
      { name: "Zhengxin Yang", isFirstAuthor: true },
      { name: "Jingyu Li" },
      { name: "Jiawei Hu" },
      { name: "Yang Feng" },
    ],
  },
];
