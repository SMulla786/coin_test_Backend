import { Request, Response } from "express";
import prisma from "../client";

const coinController = async (req: Request, res: Response) => {
  try {
    const { symbol, name, price } = req.body;
    const coin = await prisma.coin.create({
      data: {
        symbol,
        name,
        price,
      },
    });

    await prisma.coinPriceHistory.create({
      data: {
        coinId: coin.id,
        price,
      },
    });
    res.json({
      message: "Coin controller",
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
    return;
  }
};

const geCoinInfo = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const coin = await prisma.coin.findUnique({
    where: {
      symbol: symbol,
    },
  });
  res.json({ coin });
  return;
};

const purchaseController = async (req: Request, res: Response) => {
  try {
    const { symbol, amount, userId } = req.body;
    const coin = await prisma.coin.findUnique({
      where: {
        symbol: symbol,
      },
    });

    if (!coin) {
      return res.status(404).json({
        message: "Coin not found",
      });
    }

    const purchaseAmount = amount - amount * 0.1;
    const coinReceived = parseFloat(
      (purchaseAmount / coin.price.toNumber()).toFixed(2)
    ); // Convert Decimal to number
    await prisma.purchase.create({
      data: {
        coinId: coin.id,
        amount,
        userId,
        coinReceived,
      },
    });

    await prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          increment: coinReceived,
        },
      },
    });

    const coinInfo = await calculateCoinPrice(coin.id);
    res.json({
      message: `${coinReceived} coin added to wallet`,
      coinInfo,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
    return;
  }
};

const sellController = async (req: Request, res: Response) => {
  try {
    const { symbol, coins, userId } = req.body;
    const coin = await prisma.coin.findUnique({
      where: {
        symbol,
      },
    });

    if (!coin) {
      res.status(404).json({
        message: "Coin not found",
      });
      return;
    }
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
    });
    if (!wallet) {
      res.status(404).json({
        message: "Wallet not found",
      });
      return;
    }
    if (coins > wallet.balance) {
      res.status(404).json({
        message: "Insufficient balance",
      });
      return;
    }
    const totalamount = parseFloat((coins * coin.price.toNumber()).toFixed(2)); // Convert Decimal to number
    const amount = totalamount - totalamount * 0.1;

    await prisma.sell.create({
      data: {
        coinId: coin.id,
        amount,
        userId,
        coinSent: coins,
      },
    });

    const coinInfo = await calculateCoinPrice(coin.id);
    res.json({
      message: `${coins} sold. You have received amount : ₹ ${amount}`,
      coinInfo,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
    return;
  }
};

const userRegistration = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 0,
    },
  });
  res.json({
    message: "User registered",
  });
  return;
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  const isPasswordValid = password === user.password;
  if (!isPasswordValid) {
    res.status(401).json({
      message: "Invalid password",
    });
    return;
  }

  res.json({
    message: "Login successful",
    data: user,
  });
  return;
};

const userInfo = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        wallet: true,
        purchase: true,
        sell: true,
      },
    });
    res.json({ user });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
    return;
  }
};

const coinHistory = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const coin = await prisma.coin.findUnique({
      where: {
        symbol,
      },
      include: {
        coinPriceHistory: {
          select: {
            price: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        sell: {
          select: {
            amount: true,
            coinSent: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        purchase: {
          select: {
            amount: true,
            coinReceived: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    res.json({ coin });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
    return;
  }
};

export default {
  coinController,
  purchaseController,
  sellController,
  userRegistration,
  login,
  geCoinInfo,
  userInfo,
  coinHistory,
};

async function calculateCoinPrice(coinId: string) {
  const coin = await prisma.coin.findUnique({
    where: {
      id: coinId,
    },
  });

  if (!coin) {
    throw new Error("Coin not found");
  }

  const totalPurchase = await prisma.purchase.aggregate({
    where: {
      coinId: coinId,
    },
    _sum: {
      amount: true,
      coinReceived: true,
    },
  });

  const totalSell = await prisma.sell.aggregate({
    where: {
      coinId: coinId,
    },
    _sum: {
      amount: true,
      coinSent: true,
    },
  });

  const BV =
    (Number(totalPurchase._sum?.amount) || 0) -
    (Number(totalSell._sum?.amount) || 0);
  const fund =
    (Number(totalPurchase._sum?.coinReceived) || 0) -
    (Number(totalSell._sum?.coinSent) || 0);
  console.log("BV", BV);
  console.log("fund", fund);

  const updatedPrice = parseFloat((BV / fund).toFixed(3));
  console.log("updatedprice", updatedPrice);

  // Convert Decimal to number
  await prisma.coinPriceHistory.create({
    data: {
      coinId: coinId,
      price: fund === 0 ? coin.price.toNumber() : updatedPrice,
    },
  });

  const coinInfo = await prisma.coin.update({
    where: {
      id: coinId, // Change coinId to id
    },
    data: {
      price: fund === 0 ? coin.price.toNumber() : updatedPrice, // Convert Decimal to number
    },
  });

  return coinInfo;
}
