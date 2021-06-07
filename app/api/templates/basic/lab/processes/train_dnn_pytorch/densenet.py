"""
A class defining a densely connected neural network for binary classification
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class DenseNN(nn.Module):

    def __init__(self):
        super(DenseNN, self).__init__()

        self.dense1 = nn.Linear(30, 200)
        self.bn1 = nn.BatchNorm1d(200)
        self.dense2 = nn.Linear(200, 100)
        self.bn2 = nn.BatchNorm1d(100)

        self.dense3 = nn.Linear(100, 100)
        self.bn3 = nn.BatchNorm1d(100)

        self.output_layer = nn.Linear(100, 1)

    def forward(self, x):

        x = self.dense1(x)
        x = self.bn1(x)
        x = F.relu(x)

        x = self.dense2(x)
        x = self.bn2(x)
        x = F.relu(x)

        x = self.dense3(x)
        x = self.bn3(x)
        x = F.relu(x)

        x = self.output_layer(x)
        x = torch.sigmoid(x)

        return x
