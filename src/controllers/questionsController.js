import prisma from "../../prisma/client";

// Admin Question Controllers
export const createQuestion = async (req, res) => {
  try {
    const {
      categoryName,
      text,
      type,
      options,
      order,
      required,
      weight = 1.0,
      placeholder,
    } = req.body;

    // Get or create category
    let category = await prisma.questionCategory.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.questionCategory.create({
        data: {
          name: categoryName,
          order: await prisma.questionCategory.count(),
        },
      });
    }

    const question = await prisma.question.create({
      data: {
        categoryId: category.id,
        text,
        type,
        order:
          order ||
          (await prisma.question.count({ where: { categoryId: category.id } })),
        required: required || false,
        weight,
        placeholder,
        options: {
          create: options?.map((opt, index) => ({
            text: opt.text,
            value: opt.value,
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    res.json({ success: true, question });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create question" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      text,
      type,
      options,
      order,
      isActive,
      required,
      weight,
      placeholder,
    } = req.body;

    // Update question
    const question = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        order,
        isActive,
        required,
        weight,
        placeholder,
      },
    });

    // Update options if provided
    if (options) {
      await prisma.option.deleteMany({
        where: { questionId: id },
      });

      await prisma.option.createMany({
        data: options.map((opt, index) => ({
          questionId: id,
          text: opt.text,
          value: opt.value,
          order: index,
        })),
      });
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    res.json({ success: true, question: updatedQuestion });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update question" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.question.delete({
      where: { id },
    });

    res.json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete question" });
  }
};

export const reorderQuestions = async (req, res) => {
  try {
    const { categoryId, questionOrder } = req.body;

    const updatePromises = questionOrder.map((questionId, index) => {
      return prisma.question.update({
        where: { id: questionId },
        data: { order: index },
      });
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: "Questions reordered successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to reorder questions" });
  }
};
