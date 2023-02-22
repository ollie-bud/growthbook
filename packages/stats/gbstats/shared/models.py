from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Union

import numpy as np


@dataclass
class Statistic(ABC):
    n: int

    @property
    @abstractmethod
    def variance(self):
        pass

    @property
    def stddev(self):
        return 0 if self.variance == 0 else np.sqrt(self.variance)

    @property
    @abstractmethod
    def mean(self):
        pass

    @property
    def unadjusted_mean(self):
        """
        Return the mean that has no regression adjustments.
        Defaults to just `mean` for all statistic types besides
        RegressionAdjustedStatistic
        """
        return self.mean


@dataclass
class SampleMeanStatistic(Statistic):
    sum: float
    sum_squares: float

    @property
    def variance(self):
        if self.n <= 1:
            return 0
        return (self.sum_squares - pow(self.sum, 2) / self.n) / (self.n - 1)

    @property
    def mean(self):
        if self.n == 0:
            return 0
        return self.sum / self.n


@dataclass
class ProportionStatistic(Statistic):
    sum: float

    @property
    def sum_squares(self) -> float:
        return self.sum

    @property
    def variance(self):
        return self.mean * (1 - self.mean)

    @property
    def mean(self):
        if self.n == 0:
            return 0
        return self.sum / self.n


@dataclass
class RatioStatistic(Statistic):
    m_statistic: Union[SampleMeanStatistic, ProportionStatistic]
    d_statistic: Union[SampleMeanStatistic, ProportionStatistic]
    m_d_sum_of_products: float

    @property
    def mean(self):
        if self.d_statistic.sum == 0:
            return 0
        return self.m_statistic.sum / self.d_statistic.sum

    @property
    def variance(self):
        if self.d_statistic.mean == 0 or self.n <= 1:
            return 0
        return (
            self.m_statistic.variance / pow(self.d_statistic.mean, 2)
            - 2
            * self.covariance
            * self.m_statistic.mean
            / pow(self.d_statistic.mean, 3)
            + pow(self.m_statistic.mean, 2)
            * self.d_statistic.variance
            / pow(self.d_statistic.mean, 4)
        )

    @property
    def covariance(self):
        if self.n <= 1:
            return 0
        return (
            self.m_d_sum_of_products
            - self.m_statistic.sum * self.d_statistic.sum / self.n
        ) / (self.n - 1)


@dataclass
class RegressionAdjustedStatistic(Statistic):
    post_statistic: Union[SampleMeanStatistic, ProportionStatistic]
    pre_statistic: Union[SampleMeanStatistic, ProportionStatistic]
    post_pre_sum_of_products: float
    theta: float

    @property
    def mean(self):
        return self.post_statistic.mean - self.theta * self.pre_statistic.mean

    @property
    def unadjusted_mean(self):
        return self.post_statistic.mean

    @property
    def variance(self):
        if self.n <= 1:
            return 0
        return (
            self.post_statistic.variance
            + pow(self.theta, 2) * self.pre_statistic.variance
            - 2 * self.theta * self.covariance
        )

    @property
    def covariance(self):
        if self.n <= 1:
            return 0
        return (
            self.post_pre_sum_of_products
            - self.post_statistic.sum * self.pre_statistic.sum / self.n
        ) / (self.n - 1)


def compute_theta(
    a: RegressionAdjustedStatistic, b: RegressionAdjustedStatistic
) -> float:
    n = a.n + b.n
    joint = RegressionAdjustedStatistic(
        n=n,
        post_statistic=SampleMeanStatistic(
            n,
            a.post_statistic.sum + b.post_statistic.sum,
            a.post_statistic.sum_squares + b.post_statistic.sum_squares,
        ),
        pre_statistic=SampleMeanStatistic(
            n,
            a.pre_statistic.sum + b.pre_statistic.sum,
            a.pre_statistic.sum_squares + b.pre_statistic.sum_squares,
        ),
        post_pre_sum_of_products=a.post_pre_sum_of_products
        + b.post_pre_sum_of_products,
        theta=0,
    )
    return joint.covariance / joint.pre_statistic.variance


# Data classes for the results of tests
@dataclass
class Uplift:
    dist: str
    mean: float
    stddev: float


@dataclass
class TestResult:
    expected: float
    ci: List[float]
    uplift: Uplift


@dataclass
class BayesianTestResult(TestResult):
    chance_to_win: float
    risk: List[float]
    relative_risk: List[float]


@dataclass
class FrequentistTestResult(TestResult):
    p_value: float
