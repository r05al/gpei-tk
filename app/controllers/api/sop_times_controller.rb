class Api::SopTimesController < ApplicationController
  def index
    sop_times = SopTime.all
    render json: { sop_times: sop_times, status: 200 }
  end
end