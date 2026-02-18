// Portuguese (pt-BR) localization strings and helpers

export const ptBR = {
  // App-level
  appName: 'Mini Market Manager',
  
  // Navigation
  dashboard: 'Painel',
  
  // Dashboard
  dashboardTitle: 'Mini Market Manager',
  dashboardSubtitle: 'Selecione uma opção para começar',
  
  // Menu items
  inventory: 'Estoque',
  inventoryDescription: 'Gerenciar produtos e estoque',
  pos: 'Ponto de Venda',
  posDescription: 'Processar vendas e checkout',
  customers: 'Clientes',
  customersDescription: 'Gerenciar cadastro de clientes',
  cashRegister: 'Caixa',
  cashRegisterDescription: 'Abrir, fechar e ver histórico',
  salesHistory: 'Histórico de Vendas',
  salesHistoryDescription: 'Ver todas as vendas realizadas',
  
  // Inventory page
  inventoryManagement: 'Gerenciamento de Estoque',
  inventoryManagementDesc: 'Gerencie seu catálogo de produtos e níveis de estoque',
  addProduct: 'Adicionar Produto',
  editProduct: 'Editar Produto',
  addNewProduct: 'Adicionar Novo Produto',
  deleteProductConfirm: (name: string) => `Tem certeza que deseja excluir "${name}"?`,
  
  // Product form
  productName: 'Nome do Produto',
  productNamePlaceholder: 'Digite o nome do produto',
  category: 'Categoria',
  selectCategory: 'Selecione a categoria',
  salePrice: 'Preço de Venda (R$)',
  stockQuantity: 'Quantidade em Estoque',
  productImage: 'Imagem do Produto',
  
  // Product table
  image: 'Imagem',
  name: 'Nome',
  price: 'Preço',
  stock: 'Estoque',
  actions: 'Ações',
  noImage: 'Sem imagem',
  low: 'Baixo',
  noProductsFound: 'Nenhum produto encontrado. Adicione seu primeiro produto para começar.',
  
  // Product filters
  searchProducts: 'Buscar Produtos',
  searchByName: 'Buscar por nome...',
  filterByCategory: 'Filtrar por Categoria',
  allCategories: 'Todas as categorias',
  
  // Categories (display labels)
  categoryLabels: {
    'Beverages': 'Bebidas',
    'Snacks': 'Lanches',
    'Dairy': 'Laticínios',
    'Bakery': 'Padaria',
    'Frozen': 'Congelados',
    'Household': 'Utilidades Domésticas',
    'Personal Care': 'Cuidados Pessoais',
    'Other': 'Outros',
  },
  
  // POS page
  pointOfSale: 'Ponto de Venda',
  pointOfSaleDesc: 'Selecione produtos e complete o checkout',
  products: 'Produtos',
  shoppingCart: 'Carrinho de Compras',
  checkout: 'Checkout',
  cashRegisterNotOpen: 'O caixa não está aberto. As vendas ainda podem ser processadas, mas não serão rastreadas nas sessões de caixa.',
  
  // Cart
  cartEmpty: 'Carrinho vazio. Adicione produtos para começar.',
  each: 'cada',
  total: 'Total',
  addToCart: 'Adicionar ao Carrinho',
  
  // Product picker
  noProductsMatching: 'Nenhum produto encontrado com sua busca.',
  stockLabel: 'Estoque',
  
  // Checkout
  paymentMethod: 'Método de Pagamento',
  paymentMethodRequired: 'Método de Pagamento *',
  selectPaymentMethod: 'Selecione o método de pagamento',
  amountPaid: 'Valor Pago (R$)',
  change: 'Troco',
  completeSale: 'Concluir Venda',
  
  // Payment methods (display labels)
  paymentMethodLabels: {
    'Credit': 'Crédito',
    'Debit': 'Débito',
    'PIX': 'PIX',
  },
  
  // Payment errors
  selectPaymentMethodError: 'Por favor, selecione um método de pagamento',
  amountPaidInsufficient: 'O valor pago deve ser maior ou igual ao total',
  onlyUnitsAvailable: (stock: number) => `Apenas ${stock} unidades disponíveis em estoque`,
  
  // Sale completion
  saleCompletedSuccess: 'Venda Concluída com Sucesso!',
  startNewSale: 'Iniciar Nova Venda',
  
  // Raffle
  raffleEligible: 'CLIENTE ELEGÍVEL PARA O SORTEIO!',
  
  // Customers page
  customerManagement: 'Gerenciamento de Clientes',
  customerManagementDesc: 'Gerencie cadastros de clientes e veja histórico de compras',
  addCustomer: 'Adicionar Cliente',
  editCustomer: 'Editar Cliente',
  addNewCustomer: 'Adicionar Novo Cliente',
  deleteCustomerConfirm: (name: string) => `Tem certeza que deseja excluir o cliente "${name}"?`,
  cannotDeleteCustomer: (name: string, count: number) => 
    `Não é possível excluir o cliente "${name}" porque ele possui ${count} compra(s) no histórico. Registros de clientes com histórico de compras devem ser mantidos.`,
  
  // Customer form
  customerName: 'Nome do Cliente',
  customerNamePlaceholder: 'Digite o nome do cliente',
  phoneNumber: 'Número de Telefone',
  phoneNumberPlaceholder: 'Digite o número de telefone',
  
  // Customer list
  phone: 'Telefone',
  noCustomersFound: 'Nenhum cliente encontrado. Adicione seu primeiro cliente para começar.',
  
  // Customer detail
  purchaseHistory: 'Histórico de Compras',
  noPurchasesYet: 'Nenhuma compra ainda.',
  items: (count: number) => count === 1 ? 'item' : 'itens',
  
  // Cash register page
  cashRegisterTitle: 'Caixa',
  cashRegisterDesc: 'Gerencie o fluxo de caixa diário e veja o histórico de fechamentos',
  
  // Cash open panel
  openCashRegister: 'Abrir Caixa',
  openCashRegisterDesc: 'Digite o valor do fundo de troco para iniciar uma nova sessão',
  initialFloat: 'Fundo de Troco (R$)',
  cashRegisterCurrentlyOpen: 'O caixa está atualmente aberto. Feche a sessão atual antes de abrir uma nova.',
  
  // Cash close panel
  closeCashRegister: 'Fechar Caixa',
  sessionOpened: 'Sessão aberta',
  salesTotal: 'Total de Vendas',
  grandTotal: 'Total Geral',
  paymentMethodBreakdown: 'Detalhamento por Método de Pagamento',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'PIX',
  noCashSessionOpen: 'Nenhuma sessão de caixa está aberta no momento. Abra uma sessão para começar a rastrear vendas.',
  
  // Closings history
  closingHistory: 'Histórico de Fechamentos',
  noClosingRecords: 'Nenhum registro de fechamento ainda.',
  initial: 'Inicial',
  sales: 'Vendas',
  
  // Sales history page
  salesHistoryDesc: 'Visualize todas as vendas realizadas com detalhes',
  sale: 'Venda',
  viewItems: 'Ver itens',
  loadingSales: 'Carregando vendas...',
  noSalesFound: 'Nenhuma venda encontrada ainda.',
  
  // Common actions
  cancel: 'Cancelar',
  save: 'Salvar',
  saving: 'Salvando...',
  saveProduct: 'Salvar Produto',
  saveCustomer: 'Salvar Cliente',
  
  // Footer
  builtWithLove: 'Feito com amor usando',
};

// Helper to get category label in Portuguese
export function getCategoryLabel(category: string): string {
  return ptBR.categoryLabels[category as keyof typeof ptBR.categoryLabels] || category;
}

// Helper to get payment method label in Portuguese
export function getPaymentMethodLabel(method: string): string {
  return ptBR.paymentMethodLabels[method as keyof typeof ptBR.paymentMethodLabels] || method;
}

// Helper to format date in pt-BR locale
export function formatDateTimePtBR(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
