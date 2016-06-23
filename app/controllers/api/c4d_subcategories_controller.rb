class Api::C4dSubcategoriesController < ApplicationController
  def index
    if request.xhr?
      c4d_subcategories = C4dSubcategory.all
      render json: { c4d_subcategories: c4d_subcategories, status: 'success' }
    end
  end
end