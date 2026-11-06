library(ggplot2)
library(readr)

data <- read_csv("penglings.csv")
data <- data[complete.cases(data[c(
  "flipper_length_mm", "body_mass_g", "bill_length_mm", "species"
)]), ]

plot <- ggplot(data, aes(
  x = flipper_length_mm,
  y = body_mass_g,
  size = bill_length_mm,
  color = species
)) +
  geom_point(alpha = 0.8) +
  scale_color_manual(values = c("orange", "purple", "darkcyan")) +
  labs(x = "Flipper Length (mm)", y = "Body Mass (g)", size = "Bill Length (mm)", color = "Species") +
  guides(
    size = guide_legend(order = 1),
    color = guide_legend(order = 2)
  ) +
  theme_minimal()

ggsave("img/r-ggplot.png", plot, width = 8, height = 6)